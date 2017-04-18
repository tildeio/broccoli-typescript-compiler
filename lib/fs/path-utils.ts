import * as ts from "typescript";
import { Path } from "../interfaces";

const enum CharCode {
  Slash = 47,
}

export const useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
export const getCanonicalFileName = ts.sys.useCaseSensitiveFileNames
  ? (fileName: string) => fileName
  : (fileName: string) => fileName.toLowerCase();

export const defaultLibLocation = ts.getDirectoryPath(toPath(ts.sys.getExecutingFilePath()));

export function normalizePath(path: string) {
  if (path.length === 0) {
    return path;
  }
  return trimTrailingSlash(getCanonicalFileName(ts.normalizePath(path)));
}

export function isWithin(rootPath: Path, path: Path) {
  return path.length > rootPath.length &&
         path.lastIndexOf(rootPath, 0) === 0 &&
         path.charCodeAt(rootPath.length) === CharCode.Slash;
}

export function relativePathWithin(root: Path, path: Path): string | undefined {
  let relativePath: string | undefined;
  if (path.length > root.length &&
      path.lastIndexOf(root, 0) === 0 &&
      path.charCodeAt(root.length) === CharCode.Slash) {
    relativePath = path.substring(root.length + 1);
  } else if (path === root) {
    relativePath = "";
  }
  return relativePath;
}

export function toPath(fileName: string, basePath?: Path): Path {
  const p = ts.toPath(
    fileName,
    basePath === undefined ?
      currentDirectory() : basePath, getCanonicalFileName);
  return trimTrailingSlash(p);
}

export { getDirectoryPath } from "typescript";

function trimTrailingSlash(path: Path): Path;
function trimTrailingSlash(path: string): string;
function trimTrailingSlash(path: string) {
  if (path.charCodeAt(path.length - 1) === CharCode.Slash) {
    return path.slice(0, path.length - 1);
  }
  return path;
}

function currentDirectory() {
  return normalizePath(process.cwd()) as Path;
}

// tslint:disable
declare module "typescript" {
  export function getDirectoryPath(path: ts.Path): ts.Path;
  export function getDirectoryPath(path: string): string;

  export function normalizePath(path: string): string;
  export function toPath(fileName: string, basePath: string, getCanonicalFileName: (path: string) => string): ts.Path;
}
