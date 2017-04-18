import sourcemaps from 'rollup-plugin-sourcemaps';
import buble from 'rollup-plugin-buble';

export default {
  entry: 'tmp/lib/index.js',
  plugins: [
    sourcemaps(),
    buble({ transforms: { dangerousForOf: true, generator: false } })
  ],
  external: ['typescript', 'fs', 'crypto'],
  sourceMap: true,
  targets: [
    { dest: 'dist/index.js', format: 'cjs' }
  ]
};
