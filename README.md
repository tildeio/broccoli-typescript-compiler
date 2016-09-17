**This is a work-in-progress.**

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

In your `Brocfile.js`:

```js
var typescript = require('broccoli-typescript-compiler').typescript;
var cjsTree = typescript(inputTree, {
  tsconfig: {,
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
    files: ["src/index.ts"]
  },
  annotation: "compile program"
});
```
Legacy filter behavior (compile all .ts files and only .ts and
passthrough everything else).

```js
var filter = require('broccoli-typescript-compiler');
var scriptTree = filter(inputTree);
```
