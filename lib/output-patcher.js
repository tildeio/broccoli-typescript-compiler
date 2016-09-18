import * as fs from "fs";
import { md5Hex, walkSync, FSTree } from "./helpers";
import { createMap } from "./utils";
export default class OutputPatcher {
    constructor(outputPath) {
        this.outputPath = outputPath;
        this.entries = [];
        this.contents = createMap();
        this.lastTree = undefined;
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
    add(relativePath, content) {
        this.entries.push(new Entry(this.outputPath, relativePath, md5Hex(content)));
        this.contents[relativePath] = content;
    }
    patch() {
        try {
            this.lastTree = this._patch();
        }
        catch (e) {
            // walkSync(output);
            this.lastTree = undefined;
            throw e;
        }
        finally {
            this.entries = [];
            this.contents = Object.create(null);
        }
    }
    _patch() {
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
class Entry {
    constructor(basePath, relativePath, checksum) {
        this.basePath = basePath;
        this.relativePath = relativePath;
        this.checksum = checksum;
        this.mode = 0;
        this.size = 0;
        this.mtime = new Date();
        this.fullPath = basePath + "/" + relativePath;
        this.checksum = checksum;
    }
    isDirectory() {
        return false;
    }
}
//# sourceMappingURL=output-patcher.js.map