import filter from "./lib/compat/filter";
import { TypeScript, typescript, TypeScriptOptions } from "./lib/plugin";

export = Object.assign<{
  (inputNode: any, options?: TypeScriptOptions);
}, {
  TypeScript: typeof TypeScript;
  typescript: (inputNode: any, options?: TypeScriptOptions) => TypeScript;
}>(filter, {
  TypeScript,
  typescript
});
