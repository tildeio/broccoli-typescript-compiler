var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Filter = require('broccoli-filter');
var TS = require('typescript');
var _ = require('lodash');
var fs = require('fs');
var TypeScript = (function (_super) {
    __extends(TypeScript, _super);
    function TypeScript(inputNode, options) {
        // TODO: Handle options... and test
        // Options: tsConfigPath, then merge in tsOptions
        _.merge({}, options.tsOptions, JSON.parse(fs.readFileSync('file', 'utf8')));
        _super.call(this, inputNode, {
            name: 'typescript',
            annotation: inputNode.annotation,
            extensions: ['ts'],
            targetExtension: 'js'
        });
    }
    TypeScript.prototype.processString = function (contents, relativePath) {
        return TS.transpileModule(contents, { compilerOptions: {}, fileName: relativePath }).outputText;
    };
    return TypeScript;
})(Filter);
module.exports = TypeScript;
