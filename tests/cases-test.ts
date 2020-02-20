import { createBuilder, createTempDir, fromDir } from "broccoli-test-helper";
import typescript from "broccoli-typescript-compiler";
import * as fs from "fs";

// tests are output to dist/tests
const testCasesDir = fromDir(`${__dirname}/../../tests/cases`);
const testCases = fs.readdirSync(testCasesDir.path());
const expectationsDir = fromDir(`${__dirname}/../../tests/expectations`);

// tslint:disable-next-line:only-arrow-functions
QUnit.module("plugin-cases", function() {
  testCases.forEach(testCase => {
    QUnit.test(testCase.replace("-", " "), async assert => {
      const tree = testCasesDir.read(testCase);

      delete tree["tsconfig.json"];
      const input = await createTempDir();
      input.write(tree);

      const output = createBuilder(
        typescript(input.path(), {
          compilerOptions: {
            noEmitOnError: true,
          },
          rootPath: testCasesDir.path(testCase),
        })
      );

      await output.build();

      assert.deepEqual(output.read(), expectationsDir.read(testCase));
    });
  });
});
