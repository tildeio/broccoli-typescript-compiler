import { createBuilder, createReadableDir, createTempDir, Output, TempDir } from "broccoli-test-helper";
import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import { typescript } from "../lib/index";

const testCasesDir = createReadableDir("tests/cases");
const testCases = fs.readdirSync(testCasesDir.path());
const expectationsDir = createReadableDir("tests/expectations");

describe("TypeScriptPlugin cases", function() {
  this.timeout(10000);

  let output: Output;
  let input: TempDir;

  beforeEach(async () => {
    input = await createTempDir();
  });

  afterEach(async () => {
    await input.dispose();
    if (output) {
      await output.dispose();
      output = undefined as any;
    }
  });

  testCases.forEach((testCase) => {
    it(testCase.replace("-", " "), async () => {
      const tree = testCasesDir.read(testCase);

      delete tree["tsconfig.json"];

      input.write(tree);

      output = createBuilder(typescript(input.path(), {
        compilerOptions: {
          noEmitOnError: true,
        },
        tsconfig: testCasesDir.path(testCase + "/tsconfig.json"),
      }));

      await output.build();

      expect(output.read()).to.be.deep.equal(expectationsDir.read(testCase));
    });
  });
});
