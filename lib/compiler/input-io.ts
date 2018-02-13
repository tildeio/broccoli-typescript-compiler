import { realpathSync } from "fs";
import * as ts from "typescript";
import DirectoryEntriesCache from "../cache/directory-entries-cache";
import { AbsolutePath, CanonicalPath, DirEntries, PathResolver, Resolution } from "../interfaces";

export default class Input {
  private entriesCache: DirectoryEntriesCache;
  private realpathCache: { [path: string]: string } = Object.create(null);

  constructor(private resolver: PathResolver) {
    this.entriesCache = new DirectoryEntriesCache(resolver);
  }

  public fileExists(path: string) {
    return this.resolve(path).isFile();
  }

  public directoryExists(path: string) {
    return this.resolve(path).isDirectory();
  }

  /**
   * Used for type resolution.
   *
   * Will merge the view of input path and root path.
   */
  public getDirectories(path: string): string[] {
    const resolution = this.resolve(path);
    let directories: string[];
    if (resolution.isDirectory()) {
      if (resolution.isInput()) {
        directories = this.readdir(resolution.canonicalPathInInput).directories;
        if (resolution.isMerged()) {
          for (const other in this.readdir(resolution.canonicalPath).directories) {
            if (directories.indexOf(other) === -1) {
              directories.push(other);
            }
          }
        }
      } else {
        directories = this.readdir(resolution.canonicalPath).directories;
      }
    } else {
      directories = [];
    }
    return directories;
  }

  /**
   * Used by config parser for matching input.
   *
   * Unlike getDirectories which merges the view of input node and root.
   * We only allow this to return entries for things within the
   * broccoli input node.
   */
  public getFileSystemEntries(path: string) {
    const resolution = this.resolve(path);
    let entries: DirEntries;
    if (resolution.isDirectory() && resolution.isInput()) {
      entries = this.readdir(resolution.canonicalPathInInput);
    } else {
      entries = { files: [], directories: [] };
    }
    return entries;
  }

  public readFile(path: string): string | undefined {
    const resolution = this.resolve(path);
    let resolved: AbsolutePath | undefined;
    if (resolution.isFile()) {
      if (resolution.isInput()) {
        resolved = resolution.pathInInput;
      } else {
        resolved = resolution.path;
      }
    }
    if (resolved !== undefined) {
      return ts.sys.readFile(resolved);
    }
  }

  public relativePath(path: string): string | undefined {
    return this.resolve(path).relativePath;
  }

  public realpath(path: string): AbsolutePath | undefined {
    const resolution = this.resolve(path);
    if (resolution.isInput()) {
      return resolution.path;
    } else if (resolution.exists()) {
      const realpath = realpathSync(resolution.path, this.realpathCache);
      return this.resolve(realpath).path;
    }
  }

  public reset() {
    this.entriesCache.clear();
    this.realpathCache = Object.create(null);
  }

  private resolve(path: string): Resolution {
    return this.resolver.resolve(path);
  }

  private readdir(path: CanonicalPath) {
    return this.entriesCache.get(path);
  }
}
