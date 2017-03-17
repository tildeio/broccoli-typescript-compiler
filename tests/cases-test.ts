import { createBuilder, createReadableDir, createTempDir, Output, TempDir } from "broccoli-test-helper";
import { expect } from "chai";
import * as fs from "fs";
import "mocha";

const testCasesDir = createReadableDir("tests/cases");
const testCases = fs.readdirSync(testCasesDir.path());
const expectationsDir = createReadableDir("tests/expectations");
import filter = require("../index");
const typescript = filter.typescript;

// tslint:disable-next-line:only-arrow-functions
describe("transpile TypeScript", function () {
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
    }
  });

  testCases.forEach((testCase) => {
    it(testCase.replace("-", " "), async () => {
      let tree = testCasesDir.read(testCase);

      delete tree["tsconfig.json"];

      input.write(tree);

      output = createBuilder(typescript(input.path(), {
        tsconfig: testCasesDir.path(testCase + "/tsconfig.json")
      }));

      await output.build();

      expect(output.read()).to.be.deep.equal(expectationsDir.read(testCase));
    });
  });
});
