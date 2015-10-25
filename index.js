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
    var configFile = fs.readFileSync(tsconfigPath);
    var rawConfig = ts.parseConfigFileTextToJson(tsconfigPath, configFile);

    if (rawConfig.error) {
      throw new Error(rawConfig.error);
    }

    var parsedConfig = ts.convertCompilerOptionsFromJson(rawConfig.config.compilerOptions, path.dirname(tsconfigPath));

    // var parsedConfig = ts.readConfigFile(tsconfigPath);

    // var parsedConfig = ts.readConfigFile(rawConfig.config, ts.sys, path.dirname(tsconfigPath));

    if (parsedConfig.errors && parsedConfig.errors.length) {
      throw new Error(parsedConfig.errors.join(', '));
    }

    return parsedConfig.options;
  } catch(e) {
    throw new Error("Cannot load tsconfig.json from " + path + ": " + e.message);
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
    console.log("TYPESCRIPT ERROR: " + e.message)
    console.log(e.stack + "\n");

    return "";
  }
};

module.exports = TypeScript;
