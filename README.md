# broccoli-typescript-compiler

[![Build Status](https://travis-ci.org/tildeio/broccoli-typescript-compiler.svg?branch=master)](https://travis-ci.org/tildeio/broccoli-typescript-compiler)
[![Build status](https://ci.appveyor.com/api/projects/status/xg70wjppvd3l7e50?svg=true)](https://ci.appveyor.com/project/embercli/broccoli-typescript-compiler)

A [Broccoli](https://github.com/broccolijs/broccoli) plugin which
compiles [TypeScript](http://www.typescriptlang.org) files.

## How to install?

```sh
$ npm install broccoli-typescript-compiler --save-dev
```

## How to use?

```js
var typescript = require('broccoli-typescript-compiler').typescript;
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
      declaration: true
    },
    files: [
      "src/index.ts",
      "src/tests/**"
    ]
  },
  annotation: "compile program"
});
```

### Config Options:

`tsconfig:` 
* default (when ommited): will find the nearest `tsconfig` relative to where the BroccoliTypeScriptCompiler is invoked.
* as string: a absolute path to a config tsconfig file
* as config object: See: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

### Ways to use:

via the broccoli plugin subclass

```js
var TypeScript = require('broccoli-typescript-compiler').TypeScript;
```

via a function:

```js
var filter = require('broccoli-typescript-compiler');
var scriptTree = filter(inputTree);
```
