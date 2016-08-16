import * as fs from "fs";
import { md5Hex, walkSync, WalkSync, FSTree } from "./helpers";
import { createMap } from "./utils";

export default class OutputPatcher {
  private entries: WalkSync.Entry[] = [];
  private contents = createMap<string>();
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
    this.contents[relativePath] = content;
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
      this.contents = Object.create(null);
    }
  }

  private _patch() {
    let { entries, lastTree, isUnchanged, outputPath, contents } = this;
    let nextTree = FSTree.fromEntries(entries, {
      sortAndExpand: true
    });
    if (!lastTree) {
      lastTree = FSTree.fromEntries(walkSync.entries(outputPath));
    }
    let patch = lastTree.calculatePatch(nextTree, isUnchanged);
    patch.forEach(([op, path, entry]) => {
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
          fs.writeFileSync(entry.fullPath, contents[path]);
          break;
      }
    });
    return nextTree;
  }
}

class Entry implements WalkSync.Entry {
  public fullPath: string;
  public mode: number = 0;
  public size: number = 0;
  public mtime: Date = new Date();

  constructor(public basePath: string, public relativePath: string, public checksum: string) {
    this.fullPath = basePath + "/" + relativePath;
    this.checksum = checksum;
  }

  isDirectory() {
    return false;
  }
}
