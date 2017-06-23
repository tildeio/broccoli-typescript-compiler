import {
  Diagnostic,
  findConfigFile,
  ParseConfigHost,
  ParsedCommandLine,
  parseJsonConfigFileContent,
  readConfigFile,
} from "typescript";
import {getDirectoryPath } from "../fs/path-utils";
import { CompilerOptionsConfig, Path, TypeScriptConfig } from "../interfaces";
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
    const rawConfig: TypeScriptConfig = {};

    const rootPath = this.rootPath;
    const host = this.host;
    const errors: Diagnostic[] = [];
    let configFileName: Path | undefined;
    if (this.rawConfig !== undefined) {
      Object.assign(rawConfig, this.rawConfig);
    } else {
      configFileName = this.resolveConfigFileName();
      if (configFileName) {
        const readResult = readConfigFile(configFileName, host.readFile);
        if (readResult.error) {
          errors.push(readResult.error);
        } else {
          Object.assign(rawConfig, readResult.config);
        }
      }
    }
    const basePath = configFileName ? getDirectoryPath(configFileName) : rootPath;
    if (this.compilerOptions) {
      if (rawConfig.compilerOptions === undefined) {
        rawConfig.compilerOptions = this.compilerOptions;
      } else {
        rawConfig.compilerOptions = Object.assign({}, rawConfig.compilerOptions, this.compilerOptions);
      }
    }
    const result = parseJsonConfigFileContent(
      rawConfig, host, basePath, undefined, configFileName);
    result.errors = errors.concat(result.errors);
    return result;
  }

  private resolveConfigFileName(): Path {
    const { configFileName, rootPath, host } = this;
    return findConfigFile(rootPath, host.fileExists, configFileName) as Path;
  }
}
