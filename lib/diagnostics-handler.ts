import { Diagnostic, formatDiagnostics, FormatDiagnosticsHost, sys } from "typescript";
import { getCanonicalFileName } from "./fs/path-utils";
import { AbsolutePath, DiagnosticsHandler, NormalizedOptions } from "./interfaces";

export default class DiagnosticsHandlerImpl implements DiagnosticsHandler {
  private throwOnError: boolean;
  private host: FormatDiagnosticsHost;
  private write = sys.write;

  constructor(options: NormalizedOptions) {
    this.throwOnError = options.throwOnError;
    this.host = createFormatDiagnosticsHost(options.workingPath);
  }

  public setWrite(write: (s: string) => void) {
    this.write = write;
  }

  public check(diagnostics: Diagnostic | Diagnostic[] | undefined, throwOnError?: boolean): boolean {
    const normalized = normalize(diagnostics);
    if (normalized === undefined) {
      return false;
    }
    const message = this.format(normalized);
    if (this.throwOnError || throwOnError === true) {
      throw new Error(message);
    }
    this.write(message);
    return true;
  }

  public format(diagnostics: Diagnostic[]) {
    return formatDiagnostics(diagnostics, this.host);
  }
}

function normalize(diagnostics: Diagnostic | Diagnostic[] | undefined): Diagnostic[] | undefined {
  if (diagnostics === undefined) {
    return undefined;
  }
  if (Array.isArray(diagnostics)) {
    return diagnostics.length === 0 ? undefined : diagnostics;
  }
  return [ diagnostics ];
}

function createFormatDiagnosticsHost(rootPath: AbsolutePath): FormatDiagnosticsHost {
  const newLine = sys.newLine;

  return {
    getCanonicalFileName,
    getCurrentDirectory: () => rootPath,
    getNewLine: () => newLine,
  };
}
