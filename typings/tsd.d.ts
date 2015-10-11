/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../node_modules/tsconfig/dist/tsconfig.d.ts" />
/// <reference path="lodash/lodash.d.ts" />
/// <reference path="es6-promise/es6-promise.d.ts" />
/// <reference path="sinon/sinon.d.ts" />
/// <reference path="sinon-chai/sinon-chai.d.ts" />
/// <reference path="node/node.d.ts" />
/// <reference path="chai/chai.d.ts" />
/// <reference path="mocha/mocha.d.ts" />
/// <reference path="broccoli-filter/broccoli-filter.d.ts" />

// Pinkie-Promise (for tsconfig)
declare module 'pinkie-promise' {
  export = Promise
}
//

interface TSFile {
        version: number
}

interface TSFileRegistry {
        [relativeFilePath: string] : TSFile
}

interface TypeScriptFilterOptions {
	options?: TypeScriptFilterGeneralOptions,
	tsOptions?: {},
	tsConfigPath?: string,
}

interface TypeScriptFilterGeneralOptions {

}