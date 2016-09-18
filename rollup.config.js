var fs = require('fs');
var buble = require('rollup-plugin-buble');
module.exports = {
	entry: 'lib/plugin.js',
  plugins: [buble()],
  external: ['fs', 'path', 'typescript'],
	sourceMap: true,
	moduleName: 'rollup',
  dest: 'dist/plugin.js',
  format: 'cjs',
  exports: 'named'
};