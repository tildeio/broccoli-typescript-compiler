import { sys, readConfigFile, formatDiagnostics, FormatDiagnosticsHost, ParseConfigHost } from "typescript";
import { findup } from "./helpers";
import { join } from "path";

const { create: createObject } = Object;
const { newLine, useCaseSensitiveFileNames, getCurrentDirectory } = sys;

export function getCanonicalFileName(fileName: string): string {
  return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}

export function getNewLine(): string {
  return newLine;
}

export const formatDiagnosticsHost: FormatDiagnosticsHost = {
  getCurrentDirectory,
  getCanonicalFileName,
  getNewLine
};

export function findConfig(root: string): string {
  return join(findup.sync(root, "package.json"), "tsconfig.json");
}

export function readConfig(configFile: string): any {
  let result = readConfigFile(configFile, sys.readFile);
  if (result.error) {
    let message = formatDiagnostics([result.error], formatDiagnosticsHost);
    throw new Error(message);
  }
  return result.config;
}

export function createParseConfigHost(inputPath: string): ParseConfigHost {
  let rootLength = inputPath.length;
  let stripRoot = fileName => fileName.slice(rootLength);
  let realPath = fileName => inputPath + fileName;
  let fileExists = path => sys.fileExists(realPath(path));
  let readDirectory = (rootDir, extensions, excludes, includes) => sys.readDirectory(realPath(rootDir), extensions, excludes, includes).map(stripRoot);
  let readFile = path => sys.readFile(realPath(path));
  const { useCaseSensitiveFileNames } = sys;
  return {
    useCaseSensitiveFileNames,
    fileExists,
    readDirectory,
    readFile,
  };
}

export interface Map<T> {
  [key: string]: T | undefined;
}

export function createMap<T>(): Map<T> {
    const map: Map<T> = createObject(null);
    map["__"] = undefined;
    delete map["__"];
    return map;
}