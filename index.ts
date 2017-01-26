import { TypeScript, typescript, TypeScriptOptions } from "./lib/plugin";
import filter from "./lib/compat/filter";

export = Object.assign<{
  (inputNode: any, options?: TypeScriptOptions);
}, {
  TypeScript: typeof TypeScript;
  typescript: (inputNode: any, options?: TypeScriptOptions) => TypeScript;
}>(filter, {
  TypeScript,
  typescript
});
