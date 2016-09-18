import { BroccoliPlugin } from "./helpers";
import Compiler from "./compiler";
export interface TypeScriptOptions {
    tsconfig?: Object | string | undefined;
    annotation?: string | undefined;
}
export { findConfig } from "./utils";
export declare class TypeScript extends BroccoliPlugin {
    config: Object;
    configFileName: string | undefined;
    host: Compiler | undefined;
    constructor(inputTree: any, options?: TypeScriptOptions | undefined);
    build(): void;
}
