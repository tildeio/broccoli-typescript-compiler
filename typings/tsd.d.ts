/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../node_modules/tsconfig/dist/tsconfig.d.ts" />
/// <reference path="lodash/lodash.d.ts" />
/// <reference path="es6-promise/es6-promise.d.ts" />
/// <reference path="sinon/sinon.d.ts" />
/// <reference path="sinon-chai/sinon-chai.d.ts" />
/// <reference path="node/node.d.ts" />
/// <reference path="chai/chai.d.ts" />
/// <reference path="mocha/mocha.d.ts" />
/// <reference path="broccoli-persistent-filter/broccoli-persistent-filter.d.ts" />

// Pinkie-Promise (for tsconfig)
declare module 'pinkie-promise' {
  export = Promise
}
//

interface TSFile {
        hash: {
			key: {
				mtime: number,
				basePath?: string,
				relativePath?: string
			}
		},
		contents: string
}

interface TSFileRegistry {
        get(relativePath: string): TSFile;
		set(key: any, value: TSFile);
		keys(): string[];
}

interface TypeScriptFilterOptions {
	options?: TypeScriptFilterGeneralOptions,
	tsOptions?: {},
	tsConfigPath?: string,
}

interface TypeScriptFilterGeneralOptions {

}