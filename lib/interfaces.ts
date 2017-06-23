import { Stats } from "fs";
import { Diagnostic } from "typescript";
import { TypeScriptConfig } from "./generated/typescript-config";
export * from "./generated/typescript-config";

export type CompilerOptionsConfig = TypeScriptConfig["compilerOptions"];

export interface NormalizedOptions {
  rootPath: Path;
  configFileName: string | undefined;
  rawConfig: CompilerOptionsConfig | undefined;
  compilerOptions: CompilerOptionsConfig | undefined;
  throwOnError: boolean;
}

export interface DiagnosticsHandler {
  /**
   * Check for diagnostics and handle diagnostics.
   *
   * Returns true if there are errors.
   */
  check(diagnostics: Diagnostic[] | Diagnostic | undefined, throwOnError?: boolean): boolean;
}

export interface TypeScriptPluginOptions {
  /**
   * Used as the root for corresponding paths within the input node.
   * The input node will act as though it is mounted at this location.
   *
   * Acts as the current directory for compilation.
   *
   * Defaults to the current working directory.
   */
  rootPath?: string;

  /**
   * The tsconfig file name or the JSON that would be in a tsconfig.json.
   *
   * Defaults to search result of 'tsconfig.json' from `rootPath`
   *
   * The `includes` or `files` must be in the input node. External imports
   * will be resolved as though the input node were mounted at the `rootPath`
   * but non declarations should be in the input node.
   */
  tsconfig?: string | TypeScriptConfig;

  /**
   * The compilerOptions of tsconfig.
   *
   * If there is a tsconfig set or a tsconfig file is found from the root,
   * this wil be passed in as existing options during parse and the actual
   * options used will be the result of the parsed options.
   *
   * This allows you to add options in addition to whats in the tsconfig.
   */
  compilerOptions?: CompilerOptionsConfig;

  /**
   * Throw if an error occurs during compilation.
   */
  throwOnError?: boolean;

  /**
   * Broccoli node annotation.
   */
  annotation?: string;
}

export interface PathInfo {
  /**
   * The absolute path.
   */
  path: Path;

  /**
   * The corresponding absolute path in the input node if within root.
   */
  pathInInput: Path | undefined;

  /**
   * Path relative to root.
   */
  relativePath: string | undefined;
}

export type Path = string & {
  __pathBrand: any;
};

export interface Resolution extends PathInfo {
  stats: Stats | undefined;
  otherStats: Stats | undefined;

  isFile(): this is FileResolution | InputFileResolution;
  isDirectory(): this is DirectoryResolution | InputDirectoryResolution;
  isInput(): this is InputDirectoryResolution | InputFileResolution;
  isMerged(): this is MergedDirectoryResolution;

  exists(): this is FileResolution | DirectoryResolution;
}

export interface FileResolution extends Resolution {
  stats: Stats;
  otherStats: undefined;

  isFile(): this is FileResolution | InputFileResolution;
  isDirectory(): false;
  isInput(): this is InputFileResolution;
  isMerged(): false;
}

export interface InputFileResolution extends FileResolution {
  pathInInput: Path;
  relativePath: string;

  isFile(): this is InputFileResolution;
}

export interface DirectoryResolution extends Resolution {
  stats: Stats;

  isFile(): false;
  isDirectory(): this is DirectoryResolution | InputDirectoryResolution;
  isInput(): this is InputDirectoryResolution;
}

export interface InputDirectoryResolution extends DirectoryResolution {
  pathInInput: Path;
  relativePath: string;

  isFile(): false;
  isDirectory(): this is InputDirectoryResolution;
}

export interface MergedDirectoryResolution extends InputDirectoryResolution {
  otherStats: Stats;
}

export interface FileContent {
  version: string;
  buffer: Buffer;
}

export interface DirEntries {
  files: string[];
  directories: string[];
}

export interface CacheDelegate<K, CK, V> {
  cacheKey(key: K): CK;
  create(key: K): V;
}

export interface PathResolver {
  resolve(path: string): Resolution;
}
