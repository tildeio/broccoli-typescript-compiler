'use strict';

var fs = require('fs');
var ts = require('typescript');

var path = require('path');

module.exports = function loadTSConfig(tsconfigPath) {
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
      throw new Error(parsedConfig.errors.map(function(err) {
        return err.messageText;
      }).join(' '));
    }

    // "No emit" doesn't make sense here, and will cause the compiler to throw
    parsedConfig.options.noEmit = false;

    return parsedConfig.options;
  } catch(e) {
    e.message = 'Cannot load tsconfig.json from: `' + tsConfigPath + '`\n' + e.message;
    throw e;
  }
}

