import multiEntry from 'rollup-plugin-multi-entry';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { resolve } from 'path';
import * as ts from 'typescript';

const p = ts.createProgram(['dist/lib/index.d.ts'], {});
const s = p.getSourceFile('dist/lib/index.d.ts');
const c = p.getTypeChecker();
const e = c.getExportsOfModule(c.getSymbolAtLocation(s)).map(s => s.name);

const ENTRY = resolve('tmp/lib/index.js');
import buble from 'rollup-plugin-buble';

export default {
  input: 'tmp/tests/*.js',
  plugins: [
    {
      load: function(id) {
        if (id === ENTRY) {
          return {
            code: `const index = require('./index');` +
              e.map((name) => `export const ${name} = index.${name};`).join('\n'),
            map: { mappings: '' }};
        }
      }
    },
    multiEntry(),
    sourcemaps(),
    buble({ transforms: { dangerousForOf: true, generator: false } })
  ],
  external: ['mocha', 'chai', 'broccoli-test-helper', 'tslib', 'typescript', 'fs', 'path'],
  output: {
    sourcemap: true,
    file: 'dist/tests.js',
    format: 'cjs'
  }
};
