import Filter = require('broccoli-filter');
import TS = require('typescript');
import fs = require('fs');

class TypeScript extends Filter {
	constructor(inputNode: BroccoliNode, options: TypeScriptFilterOptions) {
		// TODO: Handle options... and test
		// Options: tsConfigPath, then merge in tsOptions
		_.merge({}, options.tsOptions, JSON.parse(fs.readFileSync('file', 'utf8')));
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