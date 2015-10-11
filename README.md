**This is a work-in-progress.**

# broccoli-typescript-compiler

[![Build Status](https://travis-ci.org/tildeio/broccoli-typescript-compiler.svg?branch=master)](https://travis-ci.org/tildeio/broccoli-typescript-compiler)


A [Broccoli](https://github.com/broccolijs/broccoli) plugin which
compiles [TypeScript](http://www.typescriptlang.org) files.

## How to install?

```sh
$ npm install broccoli-typescript-compiler --save-dev
```

## How to use?

In your `Brocfile.js`:

```js
var tsTranspiler = require('broccoli-typescript-compiler');
var scriptTree = tsTranspiler(inputTree);
```

Avoid const enums and internal modules