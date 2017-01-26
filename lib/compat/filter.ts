import { TypeScript, TypeScriptOptions } from "../plugin";
import * as Funnel from "broccoli-funnel";
import * as MergeTrees from "broccoli-merge-trees";

/**
 * Backwards compat filter behavior.
 *
 * Preserves the filter aspect of compiling only .ts
 * and passing through all other files.
 */
export default function filterLike(inputNode: any, options?: TypeScriptOptions) {
  let passthrough = new Funnel(inputNode, {
    exclude: ["**/*.ts"],
    annotation: "TypeScript passthrough"
  });
  let filter = new Funnel(inputNode, {
    include: ["**/*.ts"],
    annotation: "TypeScript input"
  });
  return new MergeTrees([
    passthrough,
    new TypeScript(filter, options)
  ], {
    overwrite: true,
    annotation: "TypeScript passthrough + ouput"
  });
}
