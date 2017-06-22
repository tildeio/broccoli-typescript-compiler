import {
  getDirectoryPath,
  normalizePath,
  toPath,
} from "./fs/path-utils";
import { CompilerOptionsConfig, NormalizedOptions, TypeScriptPluginOptions } from "./interfaces";

export default function normalizeOptions(options: TypeScriptPluginOptions): NormalizedOptions {
  let rootPath = options.rootPath;
  const tsconfig = options.tsconfig;

  let configFileName: string | undefined;
  let rawConfig: CompilerOptionsConfig | undefined;
  if (typeof tsconfig === "object") {
    configFileName = undefined;
    rawConfig = tsconfig;
  } else if (tsconfig) {
    configFileName = normalizePath(tsconfig);
    rawConfig = undefined;
  }

  if (rootPath === undefined) {
    if (configFileName) {
      rootPath = getDirectoryPath(configFileName);
    } else {
      rootPath = ".";
    }
  }

  let throwOnError = options.throwOnError;
  if (throwOnError === undefined) {
    throwOnError = process.env.NODE_ENV === "production";
  }

  return {
    compilerOptions: options.compilerOptions,
    configFileName,
    rawConfig,
    rootPath: toPath(rootPath),
    throwOnError,
  };
}
