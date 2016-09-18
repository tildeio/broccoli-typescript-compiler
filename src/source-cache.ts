import { FSTree, walkSync } from "./helpers";
import { createMap } from "./utils";
import { SourceFile, createSourceFile, ScriptTarget, sys, CompilerOptions, getDefaultLibFileName, getDefaultLibFilePath } from "typescript";

export default class SourceCache {
  private lastTree: FSTree | undefined = undefined;
  private cache = createMap<SourceFile>();
  private charset: string | undefined;
  public libFileName: string;
  private libFilePath: string;

  constructor(public inputPath: string,
              public options: CompilerOptions) {
    this.charset = options.charset;
    this.libFileName = "/__" + getDefaultLibFileName(options);
    this.libFilePath = getDefaultLibFilePath(options);
  }

  public updateCache() {
    let nextTree = FSTree.fromEntries(walkSync.entries(this.inputPath));
    let cache = this.cache;
    let lastTree = this.lastTree;
    if (lastTree) {
      lastTree.calculatePatch(nextTree).forEach(([op, , entry]) => {
        switch (op) {
          case "unlink":
          case "create":
          case "change":
            cache[entry.fullPath] = undefined;
            break;
        }
      });
    }
    this.lastTree = nextTree;
  }

  public realPath(fileName) {
    if (this.libFileName === fileName) {
      return this.libFilePath;
    }
    return this.inputPath + fileName;
  }

  public fileExists(fileName) {
    return sys.fileExists(this.realPath(fileName));
  }

  public readFile(fileName: string): string {
    let { cache } = this;
    let content = cache[fileName];
    if (content !== undefined) {
      return content.text;
    }
    return sys.readFile(this.realPath(fileName), this.charset);
  }

  public getSourceFile(fileName: string, languageVersion: ScriptTarget, onError: (message: string) => void): SourceFile {
    let { cache } = this;
    let sourceFile = cache[fileName];
    if (!sourceFile) {
      let text;
      try {
        text = this.readFile(fileName);
      } catch (e) {
        if (onError) {
          onError(e.message);
        }
        text = "";
      }
      sourceFile = cache[fileName] = createSourceFile(fileName, text, languageVersion);
    }
    return sourceFile;
  }
}

