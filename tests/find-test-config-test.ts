import { expect } from "chai";
import { findConfig as findTSConfig } from "../lib/utils";
import * as fixturify from "fixturify";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";
import * as os from "os";
import * as path from "path";

describe("findTSConfig", () => {
  let tmpdir = path.join(os.tmpdir(), "broccoli-typescript-compiler-test");

  beforeEach(done => {
    mkdirp(tmpdir, done);
  });

  afterEach(done => {
    rimraf(tmpdir, done);
  });

  it("basic", () => {
    fixturify.writeSync(tmpdir, {
      "tsconfig.json": "",
      "package.json": ""
    });
    expect(
      findTSConfig(tmpdir)
    ).to.eql(
      path.join(tmpdir, "tsconfig.json")
    );
  });

  it("nested, but without own package.json", () => {
    fixturify.writeSync(tmpdir, {
      "tsconfig.json": "",
      "package.json": "",
      "nested": {
        "tsconfig.json": ""
      }
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
      "tsconfig.json": "",
      "package.json": "",
      "nested": {
        "tsconfig.json": "",
        "package.json": ""
      }
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
