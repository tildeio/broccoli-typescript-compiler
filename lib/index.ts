export { default as filterTypeScript } from "./compat/filter";
export * from "./plugin";

// needed for tests
export { default as ConfigParser } from "./compiler/config-parser";
export { default as InputIO } from "./compiler/input-io";
export { default as PathResolver } from "./compiler/path-resolver";
export { normalizePath, relativePathWithin, toPath } from "./fs/path-utils";
