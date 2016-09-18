import * as ts from "typescript";
import SourceCache from "./source-cache";
import OutputPatcher from "./output-patcher";
import { heimdall } from "./helpers";
const { sys } = ts;
export default class Compiler {
    constructor(outputPath, inputPath, rawConfig, configFileName) {
        this.outputPath = outputPath;
        this.inputPath = inputPath;
        this.rawConfig = rawConfig;
        this.configFileName = configFileName;
        let output = new OutputPatcher(outputPath);
        let config = parseConfig(inputPath, rawConfig, configFileName, undefined);
        logDiagnostics(config.errors);
        let input = new SourceCache(inputPath, config.options);
        let host = createCompilerHost(input, output, config.options);
        this.output = output;
        this.config = config;
        this.input = input;
        this.host = host;
    }
    updateInput(inputPath) {
        // the config builds the list of files
        let token = heimdall.start("TypeScript:updateInput");
        let config = this.config = parseConfig(inputPath, this.rawConfig, this.configFileName, this.config.options);
        logDiagnostics(config.errors);
        if (this.inputPath !== inputPath) {
            this.inputPath = inputPath;
            this.config = config;
            this.input = new SourceCache(inputPath, config.options);
            this.host = createCompilerHost(this.input, this.output, config.options);
        }
        else {
            this.input.updateCache();
        }
        heimdall.stop(token);
    }
    compile() {
        this.createProgram();
        this.emitDiagnostics();
        this.emitProgram();
        this.patchOutput();
    }
    createProgram() {
        let { config, host } = this;
        let { fileNames, options } = config;
        let token = heimdall.start("TypeScript:createProgram");
        let program = ts.createProgram(fileNames, options, host, this.program);
        this.program = program;
        heimdall.stop(token);
    }
    emitDiagnostics() {
        // this is where bindings are resolved and typechecking is done
        let token = heimdall.start("TypeScript:emitDiagnostics");
        let diagnostics = ts.getPreEmitDiagnostics(this.program);
        logDiagnostics(diagnostics);
        heimdall.stop(token);
    }
    emitProgram() {
        let token = heimdall.start("TypeScript:emitProgram");
        let emitResult = this.program.emit();
        logDiagnostics(emitResult.diagnostics);
        heimdall.stop(token);
    }
    patchOutput() {
        let token = heimdall.start("TypeScript:patchOutput");
        this.output.patch();
        heimdall.stop(token);
    }
}
function logDiagnostics(diagnostics) {
    if (!diagnostics)
        return;
    for (let i = 0; i < diagnostics.length; i++) {
        let diagnostic = diagnostics[i];
        let message = formatDiagnostic(diagnostic);
        console.error(message);
    }
}
function formatDiagnostic(d) {
    let msg = ts.flattenDiagnosticMessageText(d.messageText, sys.newLine);
    if (!d.file)
        return msg;
    return formatMessage(d.file, d.start, msg);
}
function formatMessage(sourceFile, start, msg) {
    let loc = sourceFile.getLineAndCharacterOfPosition(start);
    return `${sourceFile.fileName}(${loc.line + 1},${loc.character + 1}): ${msg}`;
}
function parseConfig(inputPath, rawConfig, configFileName, previous) {
    let host = createParseConfigHost(inputPath);
    return ts.parseJsonConfigFileContent(rawConfig, host, "/", previous, configFileName);
}
function createParseConfigHost(inputPath) {
    let rootLength = inputPath.length;
    let stripRoot = fileName => fileName.slice(rootLength);
    let realPath = fileName => inputPath + fileName;
    return {
        useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
        fileExists: path => sys.fileExists(realPath(path)),
        readDirectory: (rootDir, extensions, excludes, includes) => sys.readDirectory(realPath(rootDir), extensions, excludes, includes).map(stripRoot)
    };
}
function createCompilerHost(input, output, options) {
    let newLine = getNewLine(options);
    let caseSensitive = ts.sys.useCaseSensitiveFileNames;
    return {
        getCurrentDirectory: () => "/",
        getNewLine: () => newLine,
        useCaseSensitiveFileNames: () => caseSensitive,
        getCanonicalFileName: fileName => caseSensitive ? fileName : fileName.toLowerCase(),
        getSourceFile: (fileName, languageVersion, onError) => input.getSourceFile(fileName, languageVersion, onError),
        getDefaultLibFileName: () => input.libFileName,
        getDirectories: path => ts.sys.getDirectories(input.realPath(path)),
        fileExists: fileName => input.fileExists(fileName),
        readFile: fileName => input.readFile(fileName),
        writeFile: (fileName, content) => {
            let relativePath = fileName.slice(1);
            output.add(relativePath, content);
        }
    };
}
function getNewLine(options) {
    let newLine;
    if (options.newLine === undefined) {
        newLine = sys.newLine;
    }
    else {
        newLine = options.newLine === ts.NewLineKind.LineFeed ? "\n" : "\r\n";
    }
    return newLine;
}
//# sourceMappingURL=compiler.js.map