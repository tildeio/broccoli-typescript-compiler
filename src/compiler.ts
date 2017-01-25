import * as ts from "typescript";
import SourceCache from "./source-cache";
import OutputPatcher from "./output-patcher";
import { heimdall } from "./helpers";
import { createParseConfigHost, formatDiagnosticsHost } from "./utils";

const { sys } = ts;

export default class Compiler {
  public config: ts.ParsedCommandLine;

  private output: OutputPatcher;
  public input: SourceCache;
  private host: ts.LanguageServiceHost;
  private languageService: ts.LanguageService;
  private program: ts.Program;

  constructor(public outputPath: string, public inputPath: string, public rawConfig: any, public configFileName: string | undefined) {
    let output = new OutputPatcher(outputPath);
    let config = parseConfig(inputPath, rawConfig, configFileName, undefined);
    logDiagnostics(config.errors);
    let input = new SourceCache(inputPath, config.options);
    this.output = output;
    this.config = config;
    this.input = input;
    this.host = createLanguageServiceHost(this);
    this.languageService = ts.createLanguageService(this.host, ts.createDocumentRegistry());
  }

  public updateInput(inputPath: string) {
    // the config builds the list of files
    let token = heimdall.start("TypeScript:updateInput");
    let config = this.config = parseConfig(inputPath, this.rawConfig, this.configFileName, this.config.options);
    logDiagnostics(config.errors);
    if (this.inputPath !== inputPath) {
      this.inputPath = inputPath;
      this.config = config;
      this.input = new SourceCache(inputPath, config.options);
    } else {
      this.input.updateCache();
    }
    heimdall.stop(token);
  }

  public compile() {
    this.createProgram();
    this.emitDiagnostics();
    this.emitProgram();
    this.patchOutput();
  }

  protected createProgram() {
    let { languageService } = this;
    let token = heimdall.start("TypeScript:createProgram");
    this.program = languageService.getProgram();
    heimdall.stop(token);
  }

  protected emitDiagnostics() {
    // this is where bindings are resolved and typechecking is done
    let token = heimdall.start("TypeScript:emitDiagnostics");
    let diagnostics = ts.getPreEmitDiagnostics(this.program);
    logDiagnostics(diagnostics);
    heimdall.stop(token);
  }

  protected emitProgram() {
    let token = heimdall.start("TypeScript:emitProgram");
    let emitResult = this.program.emit(undefined, (fileName: string, data: string) => {
      this.output.add(fileName.slice(1), data);
    });
    logDiagnostics(emitResult.diagnostics);
    heimdall.stop(token);
  }

  protected patchOutput() {
    let token = heimdall.start("TypeScript:patchOutput");
    this.output.patch();
    heimdall.stop(token);
  }
}

function logDiagnostics(diagnostics: ts.Diagnostic[] | undefined) {
  if (!diagnostics) return;
  sys.write(ts.formatDiagnostics(diagnostics, formatDiagnosticsHost));
}

function parseConfig(inputPath: string, rawConfig: any, configFileName: string | undefined, previous?: ts.CompilerOptions) {
  let host = createParseConfigHost(inputPath);
  return ts.parseJsonConfigFileContent(rawConfig, host, "/", previous, configFileName);
}

function createLanguageServiceHost(compiler: Compiler): ts.LanguageServiceHost {
  return {
    getCurrentDirectory() {
      return "/";
    },
    getCompilationSettings() {
      return compiler.config.options;
    },
    getNewLine() {
      return _getNewLine(compiler.config.options);
    },
    getScriptFileNames(): string[] {
      return compiler.config.fileNames;
    },
    getScriptVersion(fileName: string): string {
      return "" + compiler.input.getScriptVersion(fileName);
    },
    getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
      return compiler.input.getScriptSnapshot(fileName);
    },
    getDefaultLibFileName() {
      return compiler.input.libFileName;
    },
    fileExists(fileName) {
      return compiler.input.fileExists(fileName);
    },
    readFile(fileName) {
      return compiler.input.readFile(fileName);
    }
  };
}

function _getNewLine(options: ts.CompilerOptions): string {
  let newLine;
  if (options.newLine === undefined) {
    newLine = sys.newLine;
  } else {
    newLine = options.newLine === ts.NewLineKind.LineFeed ? "\n" : "\r\n";
  }
  return newLine;
}
