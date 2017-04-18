import { createTempDir, TempDir } from "broccoli-test-helper";
import { expect } from "chai";
import "mocha";
import * as ts from "typescript";
import { ConfigParser, InputIO, PathResolver, toPath } from "../lib/index";

/* tslint:disable:object-literal-sort-keys */
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:only-arrow-functions */
describe("ConfigParser", function() {
  let root: TempDir;
  let input: TempDir;
  beforeEach(async () => {
    [ root, input ] = await Promise.all([
      createTempDir(),
      createTempDir(),
    ]);
  });

  context("with an extended config", () => {
    beforeEach(() => {
      root.write({
        "tsconfig.json": `{
          "compilerOptions": {
            "moduleResolution": "node",
            "outDir": "dist",
            "types": ["foo"],
            "typeRoots": [
              "typings"
            ]
          }
        }`,
        "lib": {
          "tsconfig.json": `{
            "extends": "../tsconfig.json",
            "compilerOptions": {
              "strictNullChecks": true
            }
          }`,
          "b.ts": "export class B {};",
        },
        "typings": {
          "foo": {
            "index.d.ts": "export default class Foo {};",
          },
        },
      });
      input.write({
        "lib": {
          "a.ts": "export class A {};",
        },
      });
    });

    it("should be able to find the extended config", () => {
      const rootPath = toPath(root.path());
      const inputPath = toPath(input.path());
      const parser = new ConfigParser(rootPath,
        undefined,
        "lib/tsconfig.json",
        { module: "umd" },
        new InputIO(new PathResolver(rootPath, inputPath)),
      );
      const parsed = parser.parseConfig();
      expect(parsed.errors).to.deep.equal([]);
      expect(parsed.options).to.deep.equal({
        "configFilePath": toPath("lib/tsconfig.json", rootPath),
        "module": ts.ModuleKind.UMD,
        "moduleResolution": ts.ModuleResolutionKind.NodeJs,
        "outDir": toPath("dist", rootPath),
        "strictNullChecks": true,
        "typeRoots": [
          toPath("typings", rootPath),
        ],
        "types": [ "foo" ],
      });
      expect(parsed.fileNames).to.deep.equal([
        toPath("lib/a.ts", rootPath),
      ]);
    });
  });

  afterEach(async () => {
    await Promise.all([
      root.dispose(),
      input.dispose(),
    ]);
  });
});
