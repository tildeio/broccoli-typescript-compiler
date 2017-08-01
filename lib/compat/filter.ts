import { TypeScriptPlugin, TypeScriptPluginOptions } from "../plugin";

const Funnel: any = require("broccoli-funnel");
const MergeTrees: any = require("broccoli-merge-trees");

/**
 * Backwards compat filter behavior.
 *
 * Preserves the filter aspect of compiling only .ts
 * and passing through all other files.
 */
export default function filterLike(inputNode: any, options?: TypeScriptPluginOptions) {
  const passthrough = new Funnel(inputNode, {
    annotation: "TypeScript passthrough",
    exclude: ["**/*.ts"],
  });
  const filter = new Funnel(inputNode, {
    annotation: "TypeScript input",
    include: ["**/*.ts"],
  });
  return new MergeTrees([
    passthrough,
    new TypeScriptPlugin(filter, options),
  ], {
    annotation: "TypeScript passthrough + output",
    overwrite: true,
  });
}
