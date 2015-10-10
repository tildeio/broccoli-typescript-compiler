import Filter = require('broccoli-filter');
import TS = require('typescript');

interface TypeScriptFilterOptions {}

class TypeScript extends Filter {
	constructor(inputNode: BroccoliNode, options: TypeScriptFilterOptions) {
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