import {
  isWithin,
  normalizePath,
  toPath,
} from "./fs/path-utils";
import { CompilerOptionsConfig, NormalizedOptions, TypeScriptPluginOptions } from "./interfaces";

export default function normalizeOptions(options: TypeScriptPluginOptions): NormalizedOptions {
  const workingPath = toPath(options.workingPath === undefined ? process.cwd() : options.workingPath);
  const rootPath = options.rootPath === undefined ? workingPath : toPath(options.rootPath, workingPath);
  const projectPath = options.projectPath === undefined ? rootPath : toPath(options.projectPath, workingPath);
  const buildPath = options.buildPath === undefined ? undefined : toPath(options.buildPath, workingPath);
  const tsconfig = options.tsconfig;

  if (buildPath !== undefined &&
      !(rootPath === buildPath || isWithin(rootPath, buildPath))) {
    throw new Error(`buildPath "${buildPath}" must be at or within rootPath "${rootPath}"`);
  }

  let configFileName: string | undefined;
  let rawConfig: CompilerOptionsConfig | undefined;
  if (typeof tsconfig === "object") {
    configFileName = undefined;
    rawConfig = tsconfig;
  } else if (tsconfig) {
    configFileName = normalizePath(tsconfig);
    rawConfig = undefined;
  }

  let throwOnError = options.throwOnError;
  if (throwOnError === undefined) {
    throwOnError = process.env.NODE_ENV === "production";
  }

  return {
    buildPath,
    compilerOptions: options.compilerOptions,
    configFileName,
    projectPath,
    rawConfig,
    rootPath,
    throwOnError,
    workingPath,
  };
}
