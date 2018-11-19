QUnit.module("submodule typescript version", () => {
  QUnit.test("matches installed typescript version", assert => {
    const installedVersion = require('typescript/package').version;
    const testFixturesVersion = require('../../vendor/typescript/package').version;
    assert.equal(installedVersion, testFixturesVersion, `Installed Typescript version (${installedVersion}) does not match
      the test fixture version in 'vendor/typescript' (${testFixturesVersion})`);
  });
});