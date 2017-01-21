import { FSTree, walkSync } from "./helpers";
import { createMap } from "./utils";
import { sys, CompilerOptions, getDefaultLibFileName, getDefaultLibFilePath, IScriptSnapshot, ScriptSnapshot } from "typescript";

export default class SourceCache {
  private lastTree: FSTree | undefined = undefined;
  private cache = createMap<{
    content: string | undefined,
    version: number
  }>();
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
      lastTree.calculatePatch(nextTree).forEach(([op, path]) => {
        switch (op) {
          case "unlink":
            cache["/" + path] = undefined;
            break;
          case "change":
            let file = cache["/" + path];
            if (file) {
              file.content = undefined;
              file.version++;
            }
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

  public getScriptVersion(fileName: string): number | undefined {
    let file = this.cache[fileName];
    return file && file.version;
  }

  public getScriptSnapshot(fileName: string): IScriptSnapshot | undefined {
    return ScriptSnapshot.fromString(this.readFile(fileName));
  }

  public readFile(fileName: string): string {
    let { cache } = this;
    let file = cache[fileName];
    if (file === undefined) {
      file = cache[fileName] = {
        content: undefined,
        version: 0
      };
    }
    let content;
    if (file.content) {
      content = file.content;
    } else {
      content = file.content = sys.readFile(this.realPath(fileName), this.charset);
    }
    return content;
  }
}

