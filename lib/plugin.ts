import { BroccoliPlugin, getCallerFile } from "./helpers";
import { readConfig, findConfig } from "./utils";
import Compiler from "./compiler";

export interface TypeScriptOptions {
  tsconfig?: Object | string | undefined;
  annotation?: string | undefined;
}

export default class TypeScript extends BroccoliPlugin {
  config: Object;
  configFileName: string | undefined;
  host: Compiler | undefined;

  constructor(inputTree: any, options?: TypeScriptOptions | undefined) {
    super([ inputTree ], {
      name: "broccoli-typescript-compiler",
      persistentOutput: true,
      annotation: options && options.annotation
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

  build() {
    let { host } = this;
    if (!host) {
      host = this.host = new Compiler(this.outputPath, this.inputPaths[0], this.config, this.configFileName);
    }

    host.compile(this.inputPaths[0]);
  }
}