import {
  CompilerOptions,
  convertCompilerOptionsFromJson,
  Diagnostic,
  findConfigFile,
  ParseConfigHost,
  ParsedCommandLine,
  parseJsonConfigFileContent,
  readConfigFile,
} from "typescript";
import {getDirectoryPath } from "../fs/path-utils";
import { CompilerOptionsConfig, Path } from "../interfaces";
import createParseConfigHost from "./create-parse-config-host";
import Input from "./input-io";

export default class ConfigParser {
  private host: ParseConfigHost;

  constructor(private rootPath: Path,
              private rawConfig: CompilerOptionsConfig | undefined,
              private configFileName: string | undefined,
              private compilerOptions: CompilerOptionsConfig | undefined,
              input: Input) {
    this.host = createParseConfigHost(rootPath, input);
  }

  public parseConfig(): ParsedCommandLine {
    let rawConfig = this.rawConfig;
    const rootPath = this.rootPath;
    const host = this.host;
    const errors: Diagnostic[] = [];
    let readResult: {
      config?: any,
      error?: Diagnostic,
    } | undefined;
    let configFileName: Path | undefined;
    if (!rawConfig) {
      configFileName = this.resolveConfigFileName();
      if (configFileName) {
        readResult = readConfigFile(configFileName, host.readFile);
        if (readResult.error) {
          errors.push(readResult.error);
        } else {
          rawConfig = readResult.config;
        }
      }
    }
    if (!rawConfig) {
      rawConfig = {};
    }
    const basePath = configFileName ? getDirectoryPath(configFileName) : rootPath;
    let compilerOptions: CompilerOptions | undefined;
    if (this.compilerOptions) {
      const convertResult = convertCompilerOptionsFromJson(this.compilerOptions, basePath);
      compilerOptions = convertResult.options;
      if (convertResult.errors) {
        errors.push.apply(errors, convertResult.errors);
      }
    }
    const result = parseJsonConfigFileContent(
      rawConfig, host, basePath, compilerOptions, configFileName);
    result.errors = errors.concat(result.errors);
    return result;
  }

  private resolveConfigFileName(): Path {
    const { configFileName, rootPath, host } = this;
    return findConfigFile(rootPath, host.fileExists, configFileName) as Path;
  }
}
