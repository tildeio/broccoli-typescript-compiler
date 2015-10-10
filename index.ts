import Filter from "broccoli-filter"

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
		return '';
	}
}

export default TypeScript;