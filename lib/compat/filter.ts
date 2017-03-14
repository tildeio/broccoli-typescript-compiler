import * as Funnel from "broccoli-funnel";
import * as MergeTrees from "broccoli-merge-trees";
import { TypeScript, TypeScriptOptions } from "../plugin";

/**
 * Backwards compat filter behavior.
 *
 * Preserves the filter aspect of compiling only .ts
 * and passing through all other files.
 */
export default function filterLike(inputNode: any, options?: TypeScriptOptions) {
  let passthrough = new Funnel(inputNode, {
    annotation: "TypeScript passthrough",
    exclude: ["**/*.ts"]
  });
  let filter = new Funnel(inputNode, {
    annotation: "TypeScript input",
    include: ["**/*.ts"]
  });
  return new MergeTrees([
    passthrough,
    new TypeScript(filter, options)
  ], {
    annotation: "TypeScript passthrough + ouput",
    overwrite: true
  });
}
