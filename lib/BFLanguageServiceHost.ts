import _ts = require('typescript');
import _fs = require('fs');

class BFLanguageServiceHost implements _ts.LanguageServiceHost {
        constructor(private options: _ts.CompilerOptions,
                    private currentDirectory: string,
                    private fileRegistry: TSFileRegistry,
                    private ts = _ts,
                    private fs = _fs) {
                if (!this.options) { throw new Error("compiler options missing"); }
        }

	getCompilationSettings(): _ts.CompilerOptions {
                return this.options;
	}

        getScriptFileNames(): string[] {
                return Object.keys(this.fileRegistry);
        }

        getScriptVersion(fileName: string): string {
                if (!this.fileRegistry[fileName]) {
                        // TODO: Check if file exists?
                        this.fileRegistry[fileName] = {
                                version: 0
                        };
                }
                return this.fileRegistry[fileName].version.toString();
        }

        getScriptSnapshot(fileName: string): _ts.IScriptSnapshot {
                // TODO: use this._cache
                const fs = this.fs;
                if (!fs.existsSync(fileName)) {
                        // TODO: Delete from FileRegistry?
                        return undefined;
                }
                return this.ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
        }

        getCurrentDirectory(): string {
               return this.currentDirectory;
        }

        getDefaultLibFileName(options: _ts.CompilerOptions): string {
                return this.ts.getDefaultLibFileName(options);
        }
}

export = BFLanguageServiceHost;