interface BroccoliNode {
	annotation?: string;
}

interface FilterOptions {
	extensions: string[];
	targetExtension: string;
	name: string;
	annotation: string;
}

declare module "broccoli-persistent-filter" {
	abstract class BroccoliFilter {
		constructor(inputNode: BroccoliNode, options: FilterOptions);
		abstract processString(contents: string, relativePath: string): string;
		getDestFilePath(relativePath: string): string;
		_cache: TSFileRegistry
	}

	export = BroccoliFilter
}