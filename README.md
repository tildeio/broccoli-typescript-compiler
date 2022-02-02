# broccoli-typescript-compiler

![Build Status](https://github.com/tildeio/broccoli-typescript-compiler/workflows/CI/badge.svg)

A [Broccoli](https://github.com/broccolijs/broccoli) plugin which
compiles [TypeScript](http://www.typescriptlang.org) files.

## How to install?

```sh
$ npm install broccoli-typescript-compiler --save-dev
```

## How to use?

```js
var typescript = require("broccoli-typescript-compiler").default;
var cjsTree = typescript(inputTree, {
  tsconfig: {
    compilerOptions: {
      module: "commonjs",
      target: "es5",
      moduleResolution: "node",
      newLine: "LF",
      rootDir: "src",
      outDir: "dist",
      sourceMap: true,
      declaration: true,
    },
    files: ["src/index.ts", "src/tests/**"],
  },
  throwOnError: false,
  annotation: "compile program",
});
```

### Config Options:

`tsconfig:`

- default (when ommited): will find the nearest `tsconfig` relative to where the BroccoliTypeScriptCompiler is invoked.
- as string: a absolute path to a config tsconfig file
- as config object: See: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

`annotation:`

An optional string, which when provide should be a descriptive annotation. Useful for debugging, to tell multiple instances of the same plugin apart.

`throwOnError`

An optional boolean, defaulting to `false`. If set to `true`, will cause the build to break on errors.

_note: if `process.env.NODE_ENV === 'production'` is true, `throwOnError` will default to `true`._

### Ways to use:

## via the broccoli plugin subclass

This outputs only the emitted files from the compiled program.

```js
const { TypescriptCompiler } = require("broccoli-typescript-compiler");
let compiled = new TypescriptCompiler(input, options);
```

## via function

This outputs only the emitted files from the compiled program.

```js
const { default: typescript } = require("broccoli-typescript-compiler");

let compiled = typescript(src, options);
```

## filter function (passthrough non .ts files)

This selects only ts files from the input to compile and merges emitted files with the non ts files in the input.

```js
const { filterTypescript } = require("broccoli-typescript-compiler");
let output = filterTypescript(input, options);
```

## Development

### How to upgrade `typescript`

1. Initialize git submodules. `git submodule update --init`
2. Update `typescript` in `package.json`
3. Run `yarn run generate-tsconfig-interface`
4. Update `vendor/typescript`. `cd vendor/typescript && git fetch --tags && git checkout v[new-version-of-typescript]`
5. Commit all of the above changes
6. Run `yarn test`. There may be some changes needed to the tests to accomidate changes in TypeScript.
