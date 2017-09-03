import { matchFiles, ParseConfigHost } from "typescript";
import { useCaseSensitiveFileNames } from "../fs/path-utils";
import { Path } from "../interfaces";
import InputIO from "./input-io";

export default function createParseConfigHost(workingPath: Path, input: InputIO): ParseConfigHost {
  function getFileSystemEntries(path: string) {
    return input.getFileSystemEntries(path);
  }

  function readDirectory(
    rootDir: string,
    extensions: ReadonlyArray<string>,
    excludes: ReadonlyArray<string>,
    includes: ReadonlyArray<string>,
    depth?: number): string[] {
    return matchFiles(
      rootDir, extensions, excludes, includes,
      useCaseSensitiveFileNames, workingPath, depth, getFileSystemEntries);
  }

  function fileExists(path: string): boolean {
    return input.fileExists(path);
  }

  function readFile(path: string): string {
    return input.readFile(path) as string;
  }

  return {
    fileExists,
    readDirectory,
    readFile,
    useCaseSensitiveFileNames,
  };
}

// tslint:disable
declare module "typescript" {
  export interface FileSystemEntries {
    files: ReadonlyArray<string>;
    directories: ReadonlyArray<string>;
  }
  export function matchFiles(path: string, extensions: ReadonlyArray<string>, excludes: ReadonlyArray<string>, includes: ReadonlyArray<string>, useCaseSensitiveFileNames: boolean, currentDirectory: string, depth: number | undefined, getFileSystemEntries: (path: string) => FileSystemEntries): string[];
}
