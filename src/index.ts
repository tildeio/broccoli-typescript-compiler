export * from "./interfaces";
export { typescript as default, TypescriptCompiler } from "./plugin";
export { default as filterTypescript } from "./compat/filter";

// needed for tests
export { default as ConfigParser } from "./compiler/config-parser";
export { default as InputIO } from "./compiler/input-io";
export { default as PathResolver } from "./compiler/path-resolver";
export {
  normalizePath,
  relativePathWithin,
  toAbsolutePath,
  toCanonicalPath,
} from "./fs/path-utils";
