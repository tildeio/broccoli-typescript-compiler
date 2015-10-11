var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Filter = require('broccoli-filter');
var ts = require('typescript');
var ConfigParser = require('./lib/ConfigParser');
var BFLanguageServiceHost = require('./lib/BFLanguageServiceHost');
var TypeScript = (function (_super) {
    __extends(TypeScript, _super);
    function TypeScript(inputNode, options) {
        this.options = new ConfigParser(options);
        this.fileRegistry = {};
        var languageServiceHost = new BFLanguageServiceHost(this.options.tsOptions().compilerOptions, undefined, this.fileRegistry);
        this.tsService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());
        _super.call(this, inputNode, {
            name: 'typescript',
            annotation: inputNode.annotation,
            extensions: ['ts'],
            targetExtension: 'js'
        });
    }
    TypeScript.prototype.processString = function (contents, relativePath) {
        // TODO: Need to know when files are deleted to remove from fileRegistry...
        // called on changed files only
        return ts.transpileModule(contents, {
            compilerOptions: this.options.tsOptions().compilerOptions,
            fileName: relativePath
        }).outputText;
    };
    return TypeScript;
})(Filter);
module.exports = TypeScript;
