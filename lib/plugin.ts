import Compiler from "./compiler";
import { BroccoliPlugin, getCallerFile, heimdall } from "./helpers";
import { findConfig, readConfig } from "./utils";

export interface TypeScriptOptions {
  tsconfig?: Object | string | undefined;
  annotation?: string | undefined;
}

export { findConfig } from "./utils";

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
export function typescript(inputNode: any, options?: TypeScriptOptions | undefined) {
  return new TypeScript(inputNode, options);
}

/**
 * TypeScript Broccoli plugin class.
 */
export class TypeScript extends BroccoliPlugin {
  private config: Object;
  private configFileName: string | undefined;
  private host: Compiler | undefined;

  constructor(inputNode: any, options?: TypeScriptOptions | undefined) {
    super([ inputNode ], {
      annotation: options && options.annotation,
      name: "broccoli-typescript-compiler",
      persistentOutput: true
    });

    let configFileName: string | undefined;
    let config: any;
    if (!options || !options.tsconfig) {
      configFileName = findConfig(getCallerFile(2));
      config = readConfig(configFileName);
    } else if (typeof options.tsconfig === "string") {
      configFileName = options.tsconfig;
      config = readConfig(configFileName);
    } else {
      configFileName = undefined;
      config = options.tsconfig;
    }

    this.config = config;
    this.configFileName = configFileName;
  }

  public build() {
    let token = heimdall.start("TypeScript:compile");
    let inputPath = this.inputPaths[0];
    let host = this.host;
    if (!host) {
      host = this.host = new Compiler(this.outputPath, inputPath, this.config, this.configFileName);
    } else {
      host.updateInput(inputPath);
    }
    host.compile();
    heimdall.stop(token);
  }
}
