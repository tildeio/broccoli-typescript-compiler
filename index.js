'use strict';

var clone      = require('clone');
var stringify  = require('json-stable-stringify');
var crypto     = require('crypto');

var chalk = require('chalk');
var filendir = require('filendir');
var fs         = require('fs');
var path       = require('path');
var ts         = require('typescript');
var walkSync = require('walk-sync');
var Funnel = require('broccoli-funnel');
var Plugin = require('broccoli-plugin');

TypeScript.prototype = Object.create(Plugin.prototype);
TypeScript.prototype.constructor = TypeScript;

function TypeScript(inputNodes, options) {
  if (!(this instanceof TypeScript)) return new TypeScript(inputNodes, options);
  
  // Process only ts files
  if (!Array.isArray(inputNodes)) inputNodes = [inputNodes];
  for(var i = 0; i < inputNodes.length; i++) {
    inputNodes[i] = new Funnel(inputNodes[i], {
      include: ['**/*.ts']
    });
  }
  
  var self = this;
  this.rootFilenames = [];
  this.files = {};
  this.cwd = undefined;
  
  this.emitFile = function(fileName, srcDir, outputPath) {
      var output = self.services.getEmitOutput(fileName);
      var hasErrors = self.hasErrors(fileName);
      
      // Log Errors
      if (hasErrors) {
          this.logErrors(fileName, srcDir);
      }
      
      // Write File
      output.outputFiles.forEach(function (o) {
        outputPath = o.name.replace(srcDir, outputPath);
        filendir.writeFileSync(outputPath, o.text, "utf8");
      });
      
      return hasErrors;
  }
  
  this.hasErrors = function(fileName) {
    return self.services.getCompilerOptionsDiagnostics()
            .concat(self.services.getSyntacticDiagnostics(fileName))
            .concat(self.services.getSemanticDiagnostics(fileName)).length > 0;
  };
  
  this.logErrors = function(fileName, srcDir) {
      var allDiagnostics = self.services.getCompilerOptionsDiagnostics()
          .concat(self.services.getSyntacticDiagnostics(fileName))
          .concat(self.services.getSemanticDiagnostics(fileName));
          
      allDiagnostics.forEach(function (diagnostic) {
          var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
          
          if (diagnostic.file) {
              var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
              console.log(chalk.red(diagnostic.file.fileName.replace(srcDir, "") + " (" + (line + 1) + "," + (character + 1) + "): " + message));
          }
          else {
              console.log(chalk.red(message));
          }
      });
  }
  
   this.servicesHost = {
      getScriptFileNames: function () { return self.rootFilenames; },
      getScriptVersion: function (fileName) { return self.files[fileName] && self.files[fileName].version.toString(); },
      getScriptSnapshot: function (fileName) {
          if (!fs.existsSync(fileName)) {
              return undefined;
          }
          return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
      },
      getCurrentDirectory: function () { return self.cwd; },
      getCompilationSettings: function () {
        return {
          allowNonTsExtensions: false,
          diagnostics: true,
          noImplicitAny: true,
          //outDir: self.outputPath, TODO: Get this working
          module: 0,
          preserveConstEnums: true,
          removeComments: false,
          sourceMap: false,
          target: 2 // ES6
        };
      },
      getDefaultLibFileName: function (options) { return ts.getDefaultLibFilePath(options); },
  };
  
  this.services = ts.createLanguageService(this.servicesHost, ts.createDocumentRegistry());
  
  Plugin.call(this, inputNodes, {
    persistentOutput: true
  });
}

TypeScript.prototype.build = function() {
  var self = this;
  
  self.inputPaths.forEach(function(srcDir) {
    var paths = walkSync(srcDir, { directories: false });
    paths.forEach(function (relativePath) {
      if (!(relativePath in self.files)) {
        // TODO: Handle removals
        var absPath = path.join(srcDir, relativePath);
        self.files[relativePath] = { 
          absPath: absPath,
          srcDir: srcDir,
          version: 0,
          stat: fs.statSync(absPath),
          needsEmit: true 
        };
        self.rootFilenames.push(absPath);
      }
    });
  });
  
  // Update version for modified files
  self.inputPaths.forEach(function(srcDir) {
    var paths = walkSync(srcDir, { directories: false });
    paths.forEach(function (relativePath) {
      var absPath = path.join(srcDir, relativePath);
      var curr = fs.statSync(absPath);
      var prev = self.files[relativePath].stat;
      if (+curr.mtime <= +prev.mtime) {
        return;
      }
      
      self.files[relativePath].version += 1;
      self.files[relativePath].stat = curr;
      self.files[relativePath].needsEmit = true;
    });
  });
  
  // Emit files that need to be emitted
  for (var file in self.files) {
    if (self.files.hasOwnProperty(file) && self.files[file].needsEmit) {
      var f = self.files[file];
      var emitFailed = self.emitFile(f.absPath, f.srcDir, self.outputPath);
      f.needsEmit = emitFailed;
    }
  }
}

module.exports = TypeScript;
