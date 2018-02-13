import { relativePathWithin, toAbsolutePath } from "../lib/fs/path-utils";

QUnit.module("path-utils", () => {
  QUnit.test("relativePathWithin", (assert) => {
    const a = toAbsolutePath("a");
    const b = toAbsolutePath("a/b");
    assert.strictEqual(relativePathWithin(a, b), "b");
    assert.strictEqual(relativePathWithin(b, a), undefined);
  });
});
