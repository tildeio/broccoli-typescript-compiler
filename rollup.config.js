import sourcemaps from "rollup-plugin-sourcemaps";

export default {
  input: "dist/index.js",
  plugins: [sourcemaps()],
  external: ["typescript", "fs", "crypto"],
  output: { sourcemap: true, file: "dist/index.cjs.js", format: "cjs" },
};
