import * as fs from "fs";
import { FSTree, md5Hex, walkSync, WalkSync } from "../helpers";

export default class OutputPatcher {
  private entries: WalkSync.Entry[] = [];
  private contents = new Map<string, string>();
  private lastTree: FSTree | undefined = undefined;
  private isUnchanged: (a: Entry, b: Entry) => boolean;

  constructor(private outputPath: string) {
    this.isUnchanged = (entryA, entryB) => {
      if (entryA.isDirectory() && entryB.isDirectory()) {
        return true;
      }
      if (entryA.mode === entryB.mode && entryA.checksum === entryB.checksum) {
        return true;
      }
      return false;
    };
  }

  // relativePath should be without leading '/' and use forward slashes
  public add(relativePath: string, content: string): void {
    this.entries.push(new Entry(this.outputPath, relativePath, md5Hex(content)));
    this.contents.set(relativePath, content);
  }

  public patch() {
    try {
      this.lastTree = this._patch();
    } catch (e) {
      // walkSync(output);
      this.lastTree = undefined;
      throw e;
    } finally {
      this.entries = [];
      this.contents = new Map<string, string>();
    }
  }

  private _patch() {
    const entries = this.entries;
    let lastTree = this.lastTree;
    const isUnchanged = this.isUnchanged;
    const outputPath = this.outputPath;
    const contents = this.contents;
    const nextTree = FSTree.fromEntries(entries, { sortAndExpand: true });
    if (!lastTree) {
      lastTree = FSTree.fromEntries(walkSync.entries(outputPath));
    }
    const patch = lastTree.calculatePatch(nextTree, isUnchanged);
    patch.forEach((change) => {
      const op = change[0];
      const path = change[1];
      const entry = change[2];
      switch (op) {
        case "mkdir":
          // the expanded dirs don't have a base
          fs.mkdirSync(outputPath + "/" + path);
          break;
        case "rmdir":
          // the expanded dirs don't have a base
          fs.rmdirSync(outputPath + "/" + path);
          break;
        case "unlink":
          fs.unlinkSync(entry.fullPath);
          break;
        case "create":
        case "change":
          fs.writeFileSync(entry.fullPath, contents.get(path));
          break;
        default: throw new Error(`unrecognized case ${op}`);
      }
    });
    return nextTree;
  }
}

/* tslint:disable:max-classes-per-file */
class Entry implements WalkSync.Entry {
  public fullPath: string;
  public mode: number = 0;
  public size: number = 0;
  public mtime: Date = new Date();

  constructor(public basePath: string, public relativePath: string, public checksum: string) {
    this.fullPath = basePath + "/" + relativePath;
    this.checksum = checksum;
  }

  public isDirectory() {
    return false;
  }
}
