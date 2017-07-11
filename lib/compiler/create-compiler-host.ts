import {
  CompilerHost,
  CompilerOptions,
  getDefaultLibFileName,
  NewLineKind,
  SourceFile,
  sys,
} from "typescript";
import {
  defaultLibLocation,
  getCanonicalFileName,
  toPath,
  useCaseSensitiveFileNames,
} from "../fs/path-utils";
import { Path } from "../interfaces";
import InputIO from "./input-io";
import SourceCache from "./source-cache";

export default function createCompilerHost(
  workingPath: Path, input: InputIO, sourceCache: SourceCache, compilerOptions: CompilerOptions,
): CompilerHost {
  const newLine = getNewLine(compilerOptions);
  return {
    directoryExists: (path) => input.directoryExists(path),
    fileExists: (path) => input.fileExists(path),
    getCanonicalFileName,
    getCurrentDirectory: () => workingPath,
    getDefaultLibFileName: (options) => toPath(getDefaultLibFileName(options), defaultLibLocation),
    getDefaultLibLocation: () => defaultLibLocation,
    getDirectories: (path) => input.getDirectories(path),
    getNewLine: () => newLine,
    getSourceFile: (fileName) => sourceCache.getSourceFile(fileName) as SourceFile,
    getSourceFileByPath: (fileName, path) => sourceCache.getSourceFileByPath(fileName, path) as SourceFile,
    readFile: (path) => input.readFile(path) as string,
    realpath: (path) => input.realpath(path) as string,
    trace: (s) => sys.write(s + newLine),
    useCaseSensitiveFileNames: () => useCaseSensitiveFileNames,
    writeFile: () => {
      // we provide a write file on emit.
      throw new Error("compiler host does not write output");
    },
  };
}

function getNewLine(options: CompilerOptions): string {
  let newLine;
  if (options.newLine === undefined) {
    newLine = sys.newLine;
  } else {
    newLine = options.newLine === NewLineKind.LineFeed ? "\n" : "\r\n";
  }
  return newLine;
}
