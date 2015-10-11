import _ts = require('typescript');

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
                return Object.keys(this.fileRegistry);
        }

        getScriptVersion(fileName: string): string {
                if (!this.fileRegistry[fileName]) {
                        // TODO: Check if file exists?
                        this.fileRegistry[fileName] = {
                                version: 0,
                                contents: "" // TODO
                        };
                }
                return this.fileRegistry[fileName].version.toString();
        }

        getScriptSnapshot(fileName: string): _ts.IScriptSnapshot {
                // TODO: use this._cache
                const entry = this.fileRegistry[fileName];
                if (!entry) {
                        return undefined;
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