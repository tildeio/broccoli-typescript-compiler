import { TypeScript, TypeScriptOptions } from "./lib/plugin";

declare var filter: {

  /**
   * Backwards compat filter behavior.
   *
   * Preserves the filter aspect of compiling only .ts
   * and passing through all other files.
   */
  (inputNode: any, options?: TypeScriptOptions): any;

  /**
   * TypeScript Broccoli plugin class.
   */
  TypeScript: TypeScript;

  findConfig(root: string): string;

  /**
   * Returns a Broccoli plugin instance that compiles
   * the files in the tsconfig.
   *
   * It is rooted to the inputNode's outputPath, all
   * files it imports must be resolvable from its input
   * except for the default library file.
   *
   * Errors are logged and it will try to emit whatever
   * it could successfully compile.
   *
   * It will only emit based on the root source files
   * you give it, by default it will look for all .ts
   * files, but if you specify a files or filesGlob
   * it will these as entry points and only compile
   * the files and files they reference from the input.
   */
  typescript(inputNode: any, options: TypeScriptOptions): TypeScript;
}

export = filter;
