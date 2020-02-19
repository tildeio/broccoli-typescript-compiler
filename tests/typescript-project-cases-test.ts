import { createBuilder, createTempDir } from "broccoli-test-helper";
import ProjectRunner from "./typescript-project-runner";

import typescript, { toAbsolutePath } from "broccoli-typescript-compiler";

// tslint:disable:no-console
const runner = new ProjectRunner({
  // tests are output to dist/tests
  typescriptDir: `${__dirname}/../../vendor/typescript`,
});

// tslint:disable:only-arrow-functions
QUnit.module("typescript-project-cases", function() {
  runner.each(project => {
    QUnit.module(project.basename, function() {
      project.each(mod => {
        QUnit.test(mod.module, async function(assert) {
          const input = await createTempDir();
          try {
            input.copy(project.dir);

            const plugin = typescript(input.path(), mod.pluginConfig);

            let errors: string | undefined;
            plugin.setDiagnosticWriter(msg => {
              if (errors === undefined) {
                errors = "";
              }
              errors += msg;
            });

            const output = createBuilder(plugin);
            try {
              await output.build();

              const actual = output.read();
              const baseline = mod.baseline;
              assert.deepEqual(actual, baseline.output);
              // We skip checking against the baseline errors because that is what TypeScript's
              // project runner does as well and now the baselines have erroneous errors.
              // https://github.com/microsoft/TypeScript/blob/a78342a160974fcf93a7b49259f712d1dc2885e8/src/testRunner/projectsRunner.ts#L223
              if (errors) {
                errors = removeRoots(errors, project.dir);
                assert.equal(errors, baseline.errors);
              }
            } finally {
              await output.dispose();
            }
          } finally {
            await input.dispose();
          }
        });
      });
    });
  });
});

function removeRoots(errors: string | undefined, rootPath: string) {
  if (errors === undefined) {
    return;
  }
  const root = toAbsolutePath(rootPath);
  const pattern = new RegExp(escapeRegExp(root + "/"), "g");
  return errors.replace(pattern, "").toLowerCase();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
