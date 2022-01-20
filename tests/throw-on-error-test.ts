import {
  createBuilder,
  createTempDir,
  Output,
  TempDir,
} from "broccoli-test-helper";
import typescript from "broccoli-typescript-compiler";

// tslint:disable-next-line:only-arrow-functions
QUnit.module("throwOnError", function({ beforeEach, afterEach }) {
  let input: TempDir;
  let output: Output | null;
  let nodeEnv: string | undefined;

  beforeEach(async () => {
    input = await createTempDir();
    output = null;

    // By default, run each test in non-production environment. Saves the current
    // value of NODE_ENV and restores it after each test.
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
  });

  afterEach(async () => {
    if (input) {
      await input.dispose();
    }
    if (output) {
      await output.dispose();
    }
    process.env.NODE_ENV = nodeEnv;
  });

  QUnit.test("does not throw on type errors by default", async assert => {
    assert.expect(1);

    input.write({
      "index.ts": `let num: number = 'string';`,
    });

    const plugin = typescript(input.path(), {
      tsconfig: {
        files: ["index.ts"],
      },
    });

    output = createBuilder(plugin);
    await output.build();

    assert.ok(true, "build completed without failure");
  });

  QUnit.test(
    "throws on type errors when throwOnErrors is set to true",
    async assert => {
      assert.expect(1);

      input.write({
        "index.ts": `let num: number = 'string';`,
      });

      const plugin = typescript(input.path(), {
        throwOnError: true,
        tsconfig: {
          files: ["index.ts"],
        },
      });

      output = createBuilder(plugin);

      try {
        await output.build();
      } catch (e) {
        assertMatches(
          assert,
          e instanceof Error ? e.message : String(e),
          /TS2322/
        );
      }
    }
  );

  QUnit.test(
    "throws on type errors if NODE_ENV is 'production'",
    async assert => {
      assert.expect(1);

      input.write({
        "index.ts": `let num: number = 'string';`,
      });

      process.env.NODE_ENV = "production";

      const plugin = typescript(input.path(), {
        tsconfig: {
          files: ["index.ts"],
        },
      });

      output = createBuilder(plugin);

      try {
        await output.build();
      } catch (e) {
        assertMatches(
          assert,
          e instanceof Error ? e.message : String(e),
          /TS2322/
        );
      }
    }
  );

  QUnit.test(
    "does not throw by default if NODE_ENV is not 'production'",
    async assert => {
      assert.expect(1);

      input.write({
        "index.ts": `let num: number = 'string';`,
      });

      const plugin = typescript(input.path(), {
        tsconfig: {
          files: ["index.ts"],
        },
      });

      output = createBuilder(plugin);

      await output.build();

      assert.ok(true, "build completed without failure");
    }
  );

  QUnit.test(
    "does not throw when NODE_ENV is 'production' if throwOnError is explicitly false",
    async assert => {
      assert.expect(1);

      input.write({
        "index.ts": `let num: number = 'string';`,
      });

      process.env.NODE_ENV = "production";

      const plugin = typescript(input.path(), {
        throwOnError: false,
        tsconfig: {
          files: ["index.ts"],
        },
      });

      output = createBuilder(plugin);

      await output.build();

      assert.ok(true, "build completed without failure");
    }
  );
});

function assertMatches(assert: Assert, str: string, regex: RegExp): void {
  const match = str.match(regex);

  assert.pushResult({
    actual: str,
    expected: regex.toString(),
    message: `Expected string to match regular expression`,
    result: !!match,
  });
}
