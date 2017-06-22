import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as rimraf from "rimraf";
import * as ts from "typescript";

// tslint:disable:no-console
const { sys } = ts;
const { useCaseSensitiveFileNames, newLine, getCurrentDirectory } = sys;

export function getNewLine() {
  return newLine;
}

export function getCanonicalFileName(fileName: string) {
  return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}

const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName,
  getCurrentDirectory,
  getNewLine,
};

export function formatDiagnostics(diagnostics: ts.Diagnostic[]): string {
  return ts.formatDiagnostics(diagnostics, formatDiagnosticsHost);
}

const outputPath = path.resolve("tests/expectations");

rimraf.sync(outputPath);

const testCases = fs.readdirSync("tests/cases");
testCases.forEach((testCaseName) => {
  console.log("test case", testCaseName);
  const basePath = path.resolve(path.join("tests/cases", testCaseName));
  console.log("basePath", basePath);
  const configFileName = path.join(basePath, "tsconfig.json");
  const configResult = ts.readConfigFile(configFileName, ts.sys.readFile);
  console.log(basePath, configFileName);
  if (configResult.error) {
    throw new Error("failed to parse config");
  }
  const config = ts.parseJsonConfigFileContent(configResult.config, ts.sys, basePath, undefined, configFileName);
  console.log(config.fileNames);
  const host = ts.createCompilerHost(config.options);
  const program = ts.createProgram(config.fileNames, config.options, host);

  const diagnostics = ts.getPreEmitDiagnostics(program);

  program.emit(undefined, (fileName, data) => {
    const outFileName = path.join(outputPath, testCaseName, path.relative(basePath, fileName));

    console.log("out", outFileName);
    sys.writeFile(outFileName, data);
  });

  console.log(formatDiagnostics(diagnostics));
});
