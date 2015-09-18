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

function TypeScript(inputTree, options) {
  if (!(this instanceof TypeScript)) {
    return new TypeScript(inputTree);
  }

  Filter.call(this, inputTree, {extensions: ['ts','d.ts'], targetExtension: 'js'});

  this.name = 'broccoli-typescript-compiler';
}

TypeScript.prototype = Object.create(Filter.prototype);
TypeScript.prototype.constructor = TypeScript;

TypeScript.prototype.baseDir = function() {
  return __dirname;
};

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
  return ts.transpileModule(string, {compilerOptions: {target: 'ES6'}}).outputText;
};

module.exports = TypeScript;
