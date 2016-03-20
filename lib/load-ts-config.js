'use strict';

var fs = require('fs');
var ts = require('typescript');
var path = require('path');

module.exports = function loadTSConfig(tsconfig) {
  var tsconfigPath = null;

  try {
    var configFile;

    if (typeof tsconfig === 'string') {
      tsconfigPath = tsconfig;
      configFile = fs.readFileSync(tsconfigPath, 'utf8');
    } else if (tsconfig && typeof tsconfig === 'object') {
      configFile = JSON.stringify(tsconfig);
    } else {
      throw new TypeError('The tsconfig option must be a tsconfig JSON object or a path to a valid tsconfig.json file');
    }

    if (configFile === '') {
      throw new TypeError('tsconfig file cannot be empty');
    }

    var rawConfig;

    if (typeof ts.parseConfigFileTextToJson === 'function') {
      // >= 1.8
      rawConfig = ts.parseConfigFileTextToJson(tsconfigPath, configFile);
    } else {
      rawConfig = ts.parseConfigFileText(tsconfigPath, configFile);
    }

    if (rawConfig.error) {
      throw new Error(rawConfig.error.messageText);
    }

    var parsedConfig, errors;
    var dirname = tsconfigPath && path.dirname(tsconfigPath);
    var basename = tsconfigPath && path.basename(tsconfigPath);
    var tsconfigJSON = rawConfig.config;

    if (typeof ts.convertCompilerOptionsFromJson === 'function') {
      if (ts.convertCompilerOptionsFromJson.length === 5) {
        // >= 1.9?
        errors = [];
        parsedConfig = ts.convertCompilerOptionsFromJson([], tsconfigJSON.compilerOptions, dirname, errors, basename || 'tsconfig.json');
      } else {
        // 1.8
        parsedConfig = ts.convertCompilerOptionsFromJson(tsconfigJSON.compilerOptions, dirname).options;
        errors = parsedConfig.errors;
      }
    } else if (typeof ts.parseJsonConfigFileContent === 'function') {
      // Handle breaking change made in typescript@1.7.3
      parsedConfig = ts.parseJsonConfigFileContent(tsconfigJSON, ts.sys, dirname).options;
      errors = parsedConfig.errors;
    } else {
      parsedConfig = ts.parseConfigFile(tsconfigJSON, ts.sys, dirname).options;
      errors = parsedConfig.errors;
    }

    if (errors && errors.length) {
      throw new Error(errors.map(function(err) {
        return err.messageText;
      }).join(' '));
    }

    // "No emit" doesn't make sense here, and will cause the compiler to throw
    parsedConfig.noEmit = false;

    return parsedConfig;
  } catch(e) {
    if (tsconfigPath) {
      e.message = 'Cannot load tsconfig.json from: `' + tsconfigPath + '`\n' + e.message;
    } else {
      e.message = 'Error while parsing tsconfig:\n' + e.message;
    }

    throw e;
  }
};

