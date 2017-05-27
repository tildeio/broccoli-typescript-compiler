import { relativePathWithin, toPath } from "../lib/fs/path-utils";

QUnit.module("path-utils", () => {
  QUnit.test("relativePathWithin", (assert) => {
    const a = toPath("a");
    const b = toPath("a/b");
    assert.strictEqual(relativePathWithin(a, b), "b");
    assert.strictEqual(relativePathWithin(b, a), undefined);
  });
});
