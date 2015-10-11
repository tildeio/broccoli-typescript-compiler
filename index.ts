import Filter = require('broccoli-persistent-filter');
import ts = require('typescript');
import fs = require('fs');
import path = require('path');
import ConfigParser = require('./lib/ConfigParser');
import BFLanguageServiceHost = require('./lib/BFLanguageServiceHost');

class TypeScript extends Filter {
	private options: ConfigParser;
	private tsService: ts.LanguageService;
	private fileRegistry: TSFileRegistry;

	constructor(inputNode: BroccoliNode, options: TypeScriptFilterOptions) {
		super(inputNode, {
			name: 'typescript',
			annotation: inputNode.toString(),
			extensions: ['ts'],
			targetExtension: 'js',
		});

		this.options = new ConfigParser(options);
		this.fileRegistry = this._cache;
		const languageServiceHost = new BFLanguageServiceHost(this.options.tsOptions().compilerOptions, path.join(__dirname, inputNode.toString()), this.fileRegistry);
		this.tsService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());
	}

	processString(contents: string, relativePath: string): string {
		// TODO: Need to know when files are deleted to remove from fileRegistry...
		// Do stale entries actually cause problems for the language service?

		// TODO: Test this.
		// TODO: Output errors
		// TODO: Reemit files in our registry that had prior build errors

		// the first time a file is built, it has no cache entry
		if (this.fileRegistry.get(relativePath)) {
			this.fileRegistry.get(relativePath).contents = contents;
			this.fileRegistry.get(relativePath).hash.key.mtime++; // Hack to trigger update since cache doesn't get updated until after processString
		} else {
			this.fileRegistry.set(relativePath, {
				contents,
				hash: { key: { mtime: 1337 } }
			}); // temporary cache entry
		}

		const output = this.tsService.getEmitOutput(relativePath);
		if (output.outputFiles.length > 1) {
			throw new Error("More than one file was emitted on this change... Are you using const enums or internal modules?");
		}

		return output.outputFiles[0].text; // after we return, our cache entry is overwritten so we lose contents. could keep separate cahce but then have to worry about deleting it
	}
}

export = TypeScript;