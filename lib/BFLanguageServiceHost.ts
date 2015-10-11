import _ts = require('typescript');
import path = require('path');
import fs = require('fs');

class BFLanguageServiceHost implements _ts.LanguageServiceHost {
        constructor(private options: _ts.CompilerOptions,
                    private currentDirectory: string,
                    private fileRegistry: TSFileRegistry,
                    private ts = _ts) {
                if (!this.options) { throw new Error("compiler options missing"); }
        }

	getCompilationSettings(): _ts.CompilerOptions {
                return this.options;
	}

        getScriptFileNames(): string[] {
                return this.fileRegistry.keys();
        }

        getScriptVersion(fileName: string): string {
                if (!this.fileRegistry.get(fileName)) {
                        return "0";
                }
                return this.fileRegistry.get(fileName).hash.key.mtime.toString();
        }

        getScriptSnapshot(fileName: string): _ts.IScriptSnapshot {
                const entry = this.fileRegistry.get(fileName);
                if (!entry) {
                        // Sometimes TS asks for non-existent files
                        return this.ts.ScriptSnapshot.fromString("");
                }

                // If more than one file changes in a build step, there is a chance that a key is overwritten and we lose the cached file contents
                // read it from disk once if we need to
                if (!entry.contents) {
                        entry.contents = fs.readFileSync(path.join(entry.hash.key.basePath, entry.hash.key.relativePath)).toString();
                }
                return this.ts.ScriptSnapshot.fromString(entry.contents);
        }

        getCurrentDirectory(): string {
               return this.currentDirectory;
        }

        getDefaultLibFileName(options: _ts.CompilerOptions): string {
                return this.ts.getDefaultLibFileName(options);
        }
}

export = BFLanguageServiceHost;