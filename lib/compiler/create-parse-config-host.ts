import { matchFiles, ParseConfigHost } from "typescript";
import { useCaseSensitiveFileNames } from "../fs/path-utils";
import { Path } from "../interfaces";
import InputIO from "./input-io";

export default function createParseConfigHost(workingPath: Path, input: InputIO): ParseConfigHost {
  function getFileSystemEntries(path: string) {
    return input.getFileSystemEntries(path);
  }

  function readDirectory(rootDir: string, extensions: string[], excludes: string[], includes: string[]): string[] {
    return matchFiles(
      rootDir, extensions, excludes, includes,
      useCaseSensitiveFileNames, workingPath, getFileSystemEntries);
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
    files: string[];
    directories: string[];
  }
  export function matchFiles(path: string, extensions: string[], excludes: string[], includes: string[], useCaseSensitiveFileNames: boolean, currentDirectory: string, getFileSystemEntries: (path: string) => FileSystemEntries): string[];
}
