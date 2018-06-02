import sourcemaps from "rollup-plugin-sourcemaps";
import buble from "rollup-plugin-buble";

export default {
  input: "dist/index.js",
  plugins: [
    sourcemaps(),
    buble({ transforms: { dangerousForOf: true, generator: false } }),
  ],
  external: ["typescript", "fs", "crypto"],
  output: { sourcemap: true, file: "dist/index.cjs.js", format: "cjs" },
};
