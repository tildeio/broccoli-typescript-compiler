import { expect } from "chai";
import "mocha";
import { relativePathWithin, toPath } from "../lib/fs/path-utils";

/* tslint:disable:no-unused-expression */

describe("path-utils", () => {
  it("relativePathWithin", () => {
    const a = toPath("a");
    const b = toPath("a/b");
    expect(relativePathWithin(a, b)).to.equal("b");
    expect(relativePathWithin(b, a)).to.be.undefined;
  });
});
