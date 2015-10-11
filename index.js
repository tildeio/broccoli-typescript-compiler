var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Filter = require('broccoli-filter');
var ts = require('typescript');
var path = require('path');
var ConfigParser = require('./lib/ConfigParser');
var BFLanguageServiceHost = require('./lib/BFLanguageServiceHost');
var TypeScript = (function (_super) {
    __extends(TypeScript, _super);
    function TypeScript(inputNode, options) {
        this.options = new ConfigParser(options);
        this.fileRegistry = {};
        var languageServiceHost = new BFLanguageServiceHost(this.options.tsOptions().compilerOptions, path.join(__dirname, inputNode.toString()), this.fileRegistry);
        this.tsService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());
        _super.call(this, inputNode, {
            name: 'typescript',
            annotation: inputNode.toString(),
            extensions: ['ts'],
            targetExtension: 'js'
        });
    }
    TypeScript.prototype.processString = function (contents, relativePath) {
        // TODO: Need to know when files are deleted to remove from fileRegistry...
        // Leverage the _cache as file registry?
        // called on changed files only
        // TODO: Test this.
        if (!this.fileRegistry[relativePath]) {
            this.fileRegistry[relativePath] = {
                version: 0,
                contents: ""
            };
        }
        console.log(relativePath, " changed");
        this.fileRegistry[relativePath].contents = contents;
        this.fileRegistry[relativePath].version++;
        var output = this.tsService.getEmitOutput(relativePath);
        if (output.outputFiles.length > 1) {
            throw new Error("More than one file was emitted on this change... Are you using const enums or internal modules?");
        }
        return output.outputFiles[0].text;
    };
    return TypeScript;
})(Filter);
module.exports = TypeScript;
