import Filter = require('broccoli-filter');
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
		this.options = new ConfigParser(options);

		this.fileRegistry = {};
		const languageServiceHost = new BFLanguageServiceHost(this.options.tsOptions().compilerOptions, path.join(__dirname, inputNode.toString()), this.fileRegistry);
		this.tsService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());

		super(inputNode, {
			name: 'typescript',
			annotation: inputNode.toString(),
			extensions: ['ts'],
			targetExtension: 'js',
		});
	}

	processString(contents: string, relativePath: string): string {
		// TODO: Need to know when files are deleted to remove from fileRegistry...
		// Leverage the _cache as file registry?
		// called on changed files only
		// TODO: Test this.
		if (!this.fileRegistry[relativePath]) {
			this.fileRegistry[relativePath] = {
				version: 0,
				contents: ""
			};
		}

		console.log(relativePath, " changed");

		this.fileRegistry[relativePath].contents = contents;
		this.fileRegistry[relativePath].version++;

		const output = this.tsService.getEmitOutput(relativePath);
		if (output.outputFiles.length > 1) {
			throw new Error("More than one file was emitted on this change... Are you using const enums or internal modules?");
		}

		return output.outputFiles[0].text;
	}
}

export = TypeScript;