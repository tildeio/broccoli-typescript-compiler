"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const ts = require("typescript");
// tslint:disable:no-console
const { sys } = ts;
const { useCaseSensitiveFileNames, newLine, getCurrentDirectory } = sys;
function getNewLine() {
    return newLine;
}
exports.getNewLine = getNewLine;
function getCanonicalFileName(fileName) {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}
exports.getCanonicalFileName = getCanonicalFileName;
const formatDiagnosticsHost = {
    getCurrentDirectory,
    getCanonicalFileName,
    getNewLine
};
function formatDiagnostics(diagnostics) {
    return ts.formatDiagnostics(diagnostics, formatDiagnosticsHost);
}
exports.formatDiagnostics = formatDiagnostics;
const outputPath = path.resolve("tests/expectations");
rimraf.sync(outputPath);
const testCases = fs.readdirSync("tests/cases");
testCases.forEach((testCaseName) => {
    console.log("test case", testCaseName);
    const basePath = path.resolve(path.join("tests/cases", testCaseName));
    console.log("basePath", basePath);
    const configFileName = path.join(basePath, "tsconfig.json");
    let configResult = ts.readConfigFile(configFileName, ts.sys.readFile);
    console.log(basePath, configFileName);
    if (configResult.error) {
        throw new Error("failed to parse config");
    }
    let config = ts.parseJsonConfigFileContent(configResult.config, ts.sys, basePath, undefined, configFileName);
    console.log(config.fileNames);
    let host = ts.createCompilerHost(config.options);
    let program = ts.createProgram(config.fileNames, config.options, host);
    let diagnostics = ts.getPreEmitDiagnostics(program);
    program.emit(undefined, (fileName, data) => {
        let outFileName = path.join(outputPath, testCaseName, path.relative(basePath, fileName));
        console.log("out", outFileName);
        sys.writeFile(outFileName, data);
    });
    console.log(formatDiagnostics(diagnostics));
});
