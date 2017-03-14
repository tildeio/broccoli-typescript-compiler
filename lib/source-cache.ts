import {
  CompilerOptions,
  getDefaultLibFileName,
  getDefaultLibFilePath,
  IScriptSnapshot,
  ScriptSnapshot,
  sys
} from "typescript";
import { FSTree, walkSync } from "./helpers";
import { createMap } from "./utils";

export default class SourceCache {
  public libFileName: string;
  private lastTree: FSTree | undefined = undefined;
  private cache = createMap<{
    content: string | undefined,
    version: number
  }>();
  private charset: string | undefined;
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
      lastTree.calculatePatch(nextTree).forEach((change) => {
        let op = change[0];
        let path = change[1];
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
          default:
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
    let text = this.readFile(fileName);
    return text !== undefined ? ScriptSnapshot.fromString(text) : undefined;
  }

  public readFile(fileName: string): string {
    let cache = this.cache;
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
