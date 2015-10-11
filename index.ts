import Filter = require('broccoli-filter');
import ts = require('typescript');
import fs = require('fs');
import ConfigParser = require('./lib/ConfigParser');
import BFLanguageServiceHost = require('./lib/BFLanguageServiceHost');

class TypeScript extends Filter {
	private options: ConfigParser;
	private tsService: ts.LanguageService;
	private fileRegistry: TSFileRegistry;

	constructor(inputNode: BroccoliNode, options: TypeScriptFilterOptions) {
		this.options = new ConfigParser(options);

		this.fileRegistry = {};
		const languageServiceHost = new BFLanguageServiceHost(this.options.tsOptions().compilerOptions, undefined, this.fileRegistry);
		this.tsService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());

		super(inputNode, {
			name: 'typescript',
			annotation: inputNode.annotation,
			extensions: ['ts'],
			targetExtension: 'js',
		});
	}

	processString(contents: string, relativePath: string): string {
		// TODO: Need to know when files are deleted to remove from fileRegistry...
		// called on changed files only
		return ts.transpileModule(contents, {
			compilerOptions: this.options.tsOptions().compilerOptions,
			fileName: relativePath
		}).outputText;
	}
}

export = TypeScript;