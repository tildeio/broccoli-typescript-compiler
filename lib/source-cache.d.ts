import { SourceFile, ScriptTarget, CompilerOptions } from "typescript";
export default class SourceCache {
    inputPath: string;
    options: CompilerOptions;
    private lastTree;
    private cache;
    private charset;
    libFileName: string;
    private libFilePath;
    constructor(inputPath: string, options: CompilerOptions);
    updateCache(): void;
    realPath(fileName: any): string;
    fileExists(fileName: any): boolean;
    readFile(fileName: string): string;
    getSourceFile(fileName: string, languageVersion: ScriptTarget, onError: (message: string) => void): SourceFile;
}
