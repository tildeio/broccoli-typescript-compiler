import { expect } from "chai";
import * as fixturify from "fixturify";
import * as mkdirp from "mkdirp";
import * as os from "os";
import * as path from "path";
import * as rimraf from "rimraf";
import { findConfig as findTSConfig } from "../lib/utils";

describe("findTSConfig", () => {
  let tmpdir = path.join(os.tmpdir(), "broccoli-typescript-compiler-test");

  beforeEach((done) => {
    mkdirp(tmpdir, done);
  });

  afterEach((done) => {
    rimraf(tmpdir, done);
  });

  it("basic", () => {
    fixturify.writeSync(tmpdir, {
      "package.json": "",
      "tsconfig.json": ""
    });
    expect(
      findTSConfig(tmpdir)
    ).to.eql(
      path.join(tmpdir, "tsconfig.json")
    );
  });

  it("nested, but without own package.json", () => {
    fixturify.writeSync(tmpdir, {
      "nested": {
        "tsconfig.json": "",
      },
      "package.json": "",
      "tsconfig.json": ""
    });
    expect(
      findTSConfig(
        path.join(tmpdir, "nested")
      )
    ).to.equal(
      path.join(tmpdir, "tsconfig.json")
    );
  });

  it("nested, but with own package.json", () => {
    fixturify.writeSync(tmpdir, {
      "nested": {
        "package.json": "",
        "tsconfig.json": ""
      },
      "package.json": "",
      "tsconfig.json": ""
    });
    expect(
      findTSConfig(
        path.join(tmpdir, "nested")
      )
    ).to.equal(
      path.join(tmpdir, "nested", "tsconfig.json")
    );
  });
});
