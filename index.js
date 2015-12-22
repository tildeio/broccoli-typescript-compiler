'use strict';

var ts         = require('typescript');
var Filter     = require('broccoli-persistent-filter');
var clone      = require('clone');
var path       = require('path');
var fs         = require('fs');
var stringify  = require('json-stable-stringify');
var mergeTrees = require('broccoli-merge-trees');
var funnel     = require('broccoli-funnel');
var crypto     = require('crypto');

function getExtensionsRegex(extensions) {
  return extensions.map(function(extension) {
    return new RegExp('\.' + extension + '$');
  });
}

function replaceExtensions(extensionsRegex, name) {
  for (var i = 0, l = extensionsRegex.length; i < l; i++) {
    name = name.replace(extensionsRegex[i], '');
  }

  return name;
}

function parseOptions(tsconfigPath) {
  try {
    var configFile = fs.readFileSync(tsconfigPath, 'utf8');
    var rawConfig;

    if (typeof ts.parseConfigFileText === 'function') {
      rawConfig = ts.parseConfigFileText(tsconfigPath, configFile);
    } else {
      // >= 1.8
      rawConfig = ts.parseConfigFileTextToJson(tsconfigPath, configFile);
    }

    if (rawConfig.error) {
      throw new Error(rawConfig.error.messageText);
    }

    var parsedConfig;

    if (typeof ts.parseConfigFile === 'function') {
      parsedConfig = ts.parseConfigFile(rawConfig.config, ts.sys, path.dirname(tsconfigPath));
    } else if (typeof ts.parseJsonConfigFileContent === 'function') {
      // Handle breaking change made in typescript@1.7.3
      parsedConfig = ts.parseJsonConfigFileContent(rawConfig.config, ts.sys, path.dirname(tsconfigPath));
    } else {
      // >= 1.8
      parsedConfig = ts.convertCompilerOptionsFromJson(rawConfig.config.compilerOptions, path.dirname(tsconfigPath));
    }

    if (parsedConfig.errors && parsedConfig.errors.length) {
      throw new Error(parsedConfig.errors.join(', '));
    }

    // "No emit" doesn't make sense here, and will cause the compiler to throw
    parsedConfig.options.noEmit = false;

    return parsedConfig.options;
  } catch(e) {
    console.error('Cannot load tsconfig.json from ' + tsconfigPath);
    console.error(e.stack + '\n');

    throw e;
  }
}

function TypeScript(inputTree, options) {
  if (!(this instanceof TypeScript)) {
    return new TypeScript(inputTree);
  }

  Filter.call(this, inputTree, {extensions: ['ts','d.ts'], targetExtension: 'js'});

  this.options = parseOptions((options && options.tsconfig) || path.join(process.cwd(), "tsconfig.json"));

  this.name = 'broccoli-typescript-compiler';
}

TypeScript.prototype = Object.create(Filter.prototype);
TypeScript.prototype.constructor = TypeScript;

/*
 * @private
 *
 * @method optionsString
 * @returns a stringifeid version of the input options
 */
TypeScript.prototype.optionsHash  = function() {
  if (!this._optionsHash) {
    this._optionsHash = crypto.createHash('md5').update(stringify(this.options), 'utf8').digest('hex');
  }
  return this._optionsHash;
};

TypeScript.prototype.cacheKeyProcessString = function(string, relativePath) {
  return this.optionsHash() + Filter.prototype.cacheKeyProcessString.call(this, string, relativePath);
};

TypeScript.prototype.processString = function (string, relativePath) {
  try{
    return ts.transpileModule(string, {compilerOptions: this.options, fileName: relativePath}).outputText;
  }catch(e){
    console.error('TYPESCRIPT ERROR:');
    console.error(e.stack + '\n');

    return '';
  }
};

module.exports = TypeScript;
