var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var broccoli_filter_1 = require("broccoli-filter");
var TS = require('typescript');
var TypeScript = (function (_super) {
    __extends(TypeScript, _super);
    function TypeScript(inputNode, options) {
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
})(broccoli_filter_1["default"]);
exports.__esModule = true;
exports["default"] = TypeScript;
