import { Stats } from "fs";
import { Diagnostic } from "typescript";
import { TypeScriptConfig } from "./generated/typescript-config";
export * from "./generated/typescript-config";

export type CompilerOptionsConfig = TypeScriptConfig["compilerOptions"];

export interface NormalizedOptions {
  workingPath: Path;
  rootPath: Path;
  projectPath: Path;
  buildPath: Path | undefined;
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
  check(diagnostics: ReadonlyArray<Diagnostic> | Diagnostic | undefined, throwOnError?: boolean): boolean;
}

export interface TypeScriptPluginOptions {
  /**
   * Acts as the current working directory for compilation.
   *
   * This affects how file paths are made relative for errors reporting.
   *
   * Defaults to `process.cwd()`.
   */
  workingPath?: string;

  /**
   * Used as the rootPath for relative paths within the input node.
   *
   * This affects type resolution for files outside the input node
   * like node_modules.
   *
   * The input node will act as though it is mounted at this location.
   *
   * The rootPath must contain the emitted files, since a broccoli node
   * cannot write outside of its outputPath.
   *
   * Defaults to options.workingPath.
   */
  rootPath?: string;

  /**
   * Used as the starting search path for the tsconfig file or the basePath for
   * config parsing if the options.tsconfig is an object.
   *
   * Most the time this is the same as the rootPath. The only time this is
   * important is if the project writes above its directory since the rootPath
   * needs to contain all emitted files.
   *
   * Acts like the -p option to tsc.
   *
   * Defaults to options.rootPath.
   */
  projectPath?: string;

  /**
   * Used as the base for output. This should be set to your broccoli output.
   *
   * Your outDir should be at or beneath this path. The emitted files will be
   * written to the output relative to this path.
   *
   * Defaults to compilerOptions.outDir (assumption is your outDir is set to where
   * you place your broccoli output) or options.rootPath.
   *
   * Set this to where the broccoli output will go.  It must contain all emitted files
   * and the broccoli node output will be relative to it.
   *
   * If your outDir is 'dist' and your broccoli output is written to 'dist' then this
   * will by default write output relative to 'dist'.
   *
   * If your broccoli output is written to 'dist' and your outDir is 'dist/a', then this
   * should be set to 'dist' so that your emitted output will be 'a' and ultimately 'dist/a'.
   */
  buildPath?: string;

  /**
   * The tsconfig file name search for from the projectPath
   * or the JSON that would be in a tsconfig.
   *
   * If it is the JSON config itself, the base path will be set to the
   * projectPath during parse.
   */
  tsconfig?: string | TypeScriptConfig;

  /**
   * The compilerOptions of tsconfig.
   *
   * This allows you to override compilerOptions in the tsconfig.
   *
   * This acts like if you specify --project plus additional options to tsc.
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
