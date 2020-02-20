import { createTempDir, TempDir } from "broccoli-test-helper";
import {
  ConfigParser,
  InputIO,
  PathResolver,
  toAbsolutePath,
} from "broccoli-typescript-compiler";
import * as ts from "typescript";

let root: TempDir;
let input: TempDir;

/* tslint:disable:object-literal-sort-keys */
/* tslint:disable:object-literal-key-quotes */
QUnit.module(
  "config-parser",
  {
    async beforeEach() {
      [root, input] = await Promise.all([createTempDir(), createTempDir()]);
    },
    async afterEach() {
      await Promise.all([root.dispose(), input.dispose()]);
    },
  },
  () => {
    QUnit.module(
      "extended config",
      {
        async beforeEach() {
          root.write({
            "tsconfig.json": `{
          "compilerOptions": {
            "moduleResolution": "Node",
            "outDir": "dist",
            "types": ["foo"],
            "typeRoots": [
              "typings"
            ]
          }
        }`,
            lib: {
              "tsconfig.json": `{
            "extends": "../tsconfig.json",
            "compilerOptions": {
              "strictNullChecks": true
            }
          }`,
              "b.ts": "export class B {};",
            },
            typings: {
              foo: {
                "index.d.ts": "export default class Foo {};",
              },
            },
          });
          input.write({
            lib: {
              "a.ts": "export class A {};",
            },
          });
        },
      },
      () => {
        QUnit.test("should be able to find the extended config", assert => {
          const rootPath = toAbsolutePath(root.path());
          const inputPath = toAbsolutePath(input.path());
          const parser = new ConfigParser(
            rootPath,
            undefined,
            "lib/tsconfig.json",
            { module: "UMD" },
            rootPath,
            new InputIO(new PathResolver(rootPath, inputPath))
          );
          const parsed = parser.parseConfig();
          assert.deepEqual(parsed.errors, []);
          assert.deepEqual(parsed.options, {
            configFilePath: toAbsolutePath("lib/tsconfig.json", rootPath),
            module: ts.ModuleKind.UMD,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            outDir: toAbsolutePath("dist", rootPath),
            strictNullChecks: true,
            typeRoots: [toAbsolutePath("typings", rootPath)],
            types: ["foo"],
          });
          assert.deepEqual(parsed.fileNames, [
            toAbsolutePath("lib/a.ts", rootPath),
          ]);
        });
      }
    );
  }
);
