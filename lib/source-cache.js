import { FSTree, walkSync } from "./helpers";
import { createMap } from "./utils";
import { createSourceFile, sys, getDefaultLibFileName, getDefaultLibFilePath } from "typescript";
export default class SourceCache {
    constructor(inputPath, options) {
        this.inputPath = inputPath;
        this.options = options;
        this.lastTree = undefined;
        this.cache = createMap();
        this.charset = options.charset;
        this.libFileName = "/__" + getDefaultLibFileName(options);
        this.libFilePath = getDefaultLibFilePath(options);
    }
    updateCache() {
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
    realPath(fileName) {
        if (this.libFileName === fileName) {
            return this.libFilePath;
        }
        return this.inputPath + fileName;
    }
    fileExists(fileName) {
        return sys.fileExists(this.realPath(fileName));
    }
    readFile(fileName) {
        let { cache } = this;
        let content = cache[fileName];
        if (content !== undefined) {
            return content.text;
        }
        return sys.readFile(this.realPath(fileName), this.charset);
    }
    getSourceFile(fileName, languageVersion, onError) {
        let { cache } = this;
        let sourceFile = cache[fileName];
        if (!sourceFile) {
            let text;
            try {
                text = this.readFile(fileName);
            }
            catch (e) {
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
//# sourceMappingURL=source-cache.js.map