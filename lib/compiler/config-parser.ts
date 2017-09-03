import * as ts from "typescript";
import {getDirectoryPath } from "../fs/path-utils";
import { CompilerOptionsConfig, Path, TypeScriptConfig } from "../interfaces";
import createParseConfigHost from "./create-parse-config-host";
import Input from "./input-io";

export default class ConfigParser {
  private host: ts.ParseConfigHost;

  constructor(private projectPath: Path,
              private rawConfig: TypeScriptConfig | undefined,
              private configFileName: string | undefined,
              private compilerOptions: CompilerOptionsConfig | undefined,
              workingPath: Path,
              input: Input) {
    this.host = createParseConfigHost(workingPath, input);
  }

  public parseConfig(): ts.ParsedCommandLine {
    const configFileName = this.resolveConfigFileName();
    const basePath = this.getBasePath(configFileName);
    const existingOptions = this.convertExistingOptions(basePath);

    const result = this.parseConfigContent(configFileName, basePath, existingOptions.options);

    if (existingOptions.errors.length > 0) {
      result.errors = existingOptions.errors.concat(result.errors);
    }

    if (result.options.noEmit === true) {
      result.options.noEmit = false;
    }

    return result;
  }

  private resolveConfigFileName(): Path | undefined {
    if (this.rawConfig !== undefined) {
      return;
    }
    return ts.findConfigFile(
      this.projectPath,
      this.host.fileExists,
      this.configFileName) as Path;
  }

  private getBasePath(configFilePath: Path | undefined) {
    if (configFilePath === undefined) {
      return this.projectPath;
    }
    return getDirectoryPath(configFilePath);
  }

  private convertExistingOptions(basePath: Path) {
    const { compilerOptions } = this;
    if (compilerOptions === undefined) {
      return {
        errors: [] as ts.Diagnostic[],
        options: undefined,
      };
    }
    return ts.convertCompilerOptionsFromJson(this.compilerOptions, basePath);
  }

  private readConfigSourceFile(configFilePath: Path | undefined): ts.JsonSourceFile | undefined {
    if (configFilePath === undefined) {
      return;
    }
    const configFileText = this.host.readFile(configFilePath);
    if (configFileText === undefined) {
      throw new Error(`File '${configFilePath}' not found.`);
    }
    return ts.parseJsonText(configFilePath, configFileText);
  }

  private parseConfigContent(
    configFileName: Path | undefined,
    basePath: Path,
    existingOptions: ts.CompilerOptions | undefined,
  ) {
    const configSourceFile = this.readConfigSourceFile(configFileName);
    if (configSourceFile === undefined) {
      return ts.parseJsonConfigFileContent(
        this.rawConfig || {}, this.host, basePath, existingOptions);
    }
    return ts.parseJsonSourceFileConfigFileContent(
      configSourceFile, this.host, basePath, existingOptions, configFileName);
  }
}
