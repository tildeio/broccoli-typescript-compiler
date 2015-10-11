var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Filter = require('broccoli-persistent-filter');
var ts = require('typescript');
var path = require('path');
var ConfigParser = require('./lib/ConfigParser');
var BFLanguageServiceHost = require('./lib/BFLanguageServiceHost');
var TypeScript = (function (_super) {
    __extends(TypeScript, _super);
    function TypeScript(inputNode, options) {
        _super.call(this, inputNode, {
            name: 'typescript',
            annotation: inputNode.toString(),
            extensions: ['ts'],
            targetExtension: 'js'
        });
        this.options = new ConfigParser(options);
        this.fileRegistry = this._cache;
        var languageServiceHost = new BFLanguageServiceHost(this.options.tsOptions().compilerOptions, path.join(__dirname, inputNode.toString()), this.fileRegistry);
        this.tsService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());
    }
    TypeScript.prototype.processString = function (contents, relativePath) {
        // TODO: Need to know when files are deleted to remove from fileRegistry...
        // Do stale entries actually cause problems for the language service?
        // TODO: Test this.
        // TODO: Output errors
        // TODO: Reemit files in our registry that had prior build errors
        // the first time a file is built, it has no cache entry
        if (this.fileRegistry.get(relativePath)) {
            this.fileRegistry.get(relativePath).contents = contents;
            this.fileRegistry.get(relativePath).hash.key.mtime++; // Hack to trigger update since cache doesn't get updated until after processString
        }
        else {
            this.fileRegistry.set(relativePath, {
                contents: contents,
                hash: { key: { mtime: 1337 } }
            }); // temporary cache entry
        }
        var output = this.tsService.getEmitOutput(relativePath);
        if (output.outputFiles.length > 1) {
            throw new Error("More than one file was emitted on this change... Are you using const enums or internal modules?");
        }
        return output.outputFiles[0].text; // after we return, our cache entry is overwritten so we lose contents. could keep separate cahce but then have to worry about deleting it
    };
    return TypeScript;
})(Filter);
module.exports = TypeScript;
