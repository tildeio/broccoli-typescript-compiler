const fixturify: Fixturify = require("fixturify");
const broccoli: Broccoli = require("broccoli");
const Funnel: Funnel.Static = require("broccoli-funnel");
const Builder = broccoli.Builder;

import { join } from "path";
import * as os from "os";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";

export default class Helper {
  _tmpdir: string;

  constructor() {
    this._tmpdir = join(os.tmpdir(), "broccoli-typescript-compiler-test");
  }

  setup(): Promise<Input> {
    let tmpdir = this._tmpdir;
    return recreateDirectory(tmpdir).then(() => new Input(tmpdir));
  }
}

export interface WriteFixtureArgs {
  fixture: Directory;
  to?: string;
}

export interface WriteFromArgs {
  from: string;
  to?: string;
}

function isFixtureArgs(args: WriteFixtureArgs | WriteFromArgs): args is WriteFixtureArgs {
  return "fixture" in args;
}

export class Input {
  constructor(private _tmpdir: string) {
  }

  write(args: WriteFixtureArgs | WriteFromArgs): void {
    let fixture: Directory;
    if (isFixtureArgs(args)) {
      fixture = args.fixture;
    } else {
      fixture = fixturify.readSync(args.from);
    }
    fixturify.writeSync(this.path(args.to), fixture);
  }

  read(args?: {
    from?: string
  }): Directory {
    return fixturify.readSync(this.path(args && args.from));
  }

  path(relativePath?: string): string {
    if (relativePath) return join(this._tmpdir, relativePath);
    return this._tmpdir;
  }

  dispose(): Promise<void> {
    return removeDirectory(this._tmpdir);
  }
}

function removeDirectory(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, err => err ? reject(err) : resolve());
  });
}

function createDirectory(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    mkdirp(path, err => err ? reject(err) : resolve());
  });
}

function recreateDirectory(path: string): Promise<void> {
  return removeDirectory(path).then(() => createDirectory(path));
}

export interface Builder {
  outputPath: string;
  cleanup(): void;
  build(): PromiseLike;
}

export namespace Builder {
  export interface Static {
    new (outputNode: any): Builder;
  }
}

export interface ThenCallback {
  (value: any | undefined | null): any | undefined | null | void;
}

export interface PromiseLike {
  then(onfulfilled: ThenCallback, onrejected?: ThenCallback): PromiseLike;
  finally(oncompleted: ThenCallback): PromiseLike;
}

export interface Funnel {
}

export namespace Funnel {
  export interface Options {
    srcDir?: string;
    destDir?: string;
    include?: string[];
    exclude?: string[];
    files?: string[];
    getDestinationPath?: (relativePath: string) => string;
  }

  export interface Static {
    new (inputNode: any, options?: Funnel.Options): Funnel;
  }
}

export interface Broccoli {
  Builder: Builder.Static;
}

export interface Fixturify {
  readSync: (dir: string) => Directory;
  writeSync: (dir: string, obj: Directory) => void;
}

export interface Directory {
  [fileName: string]: Directory | string | null | undefined;
}
