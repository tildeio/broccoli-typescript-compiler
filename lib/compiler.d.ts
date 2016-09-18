import * as ts from "typescript";
export default class Compiler {
    outputPath: string;
    inputPath: string;
    rawConfig: any;
    configFileName: string | undefined;
    config: ts.ParsedCommandLine;
    private output;
    private input;
    private host;
    private program;
    constructor(outputPath: string, inputPath: string, rawConfig: any, configFileName: string | undefined);
    updateInput(inputPath: string): void;
    compile(): void;
    protected createProgram(): void;
    protected emitDiagnostics(): void;
    protected emitProgram(): void;
    protected patchOutput(): void;
}
