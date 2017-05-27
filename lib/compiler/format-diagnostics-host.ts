import { FormatDiagnosticsHost, sys } from "typescript";

const {
  getCurrentDirectory,
  newLine,
  useCaseSensitiveFileNames,
} = sys;

function getCanonicalFileName(fileName: string): string {
  return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}

function getNewLine(): string {
  return newLine;
}

export default {
  getCanonicalFileName,
  getCurrentDirectory,
  getNewLine,
} as FormatDiagnosticsHost;
