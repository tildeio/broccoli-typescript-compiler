import Filter = require('broccoli-filter');
import TS = require('typescript');
import fs = require('fs');
import ConfigParser = require('./lib/ConfigParser');

class TypeScript extends Filter {
	private options: ConfigParser;
	
	constructor(inputNode: BroccoliNode, options: TypeScriptFilterOptions) {
		this.options = new ConfigParser(options);
		
		super(inputNode, {
			name: 'typescript',
			annotation: inputNode.annotation,
			extensions: ['ts'],
			targetExtension: 'js',
		});
	}
	
	processString(contents: string, relativePath: string): string {
		return TS.transpileModule(contents, {compilerOptions: {}, fileName: relativePath}).outputText;
	}
}

export = TypeScript;