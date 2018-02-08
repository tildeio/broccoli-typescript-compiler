import sourcemaps from 'rollup-plugin-sourcemaps';
import buble from 'rollup-plugin-buble';

export default {
  input: 'tmp/lib/index.js',
  plugins: [
    sourcemaps(),
    buble({ transforms: { dangerousForOf: true, generator: false } })
  ],
  external: ['typescript', 'fs', 'crypto'],
  output: { sourcemap: true, file: 'dist/index.js', format: 'cjs' }
};
