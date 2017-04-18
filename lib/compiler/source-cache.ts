import * as ts from "typescript";
import { readFileResolution } from "../fs/file-utils";
import { FileContent, Path, PathResolver, Resolution } from "../interfaces";

const SharedRegistry = ts.createDocumentRegistry();

interface VersionedSourceFile {
  sourceFile: ts.SourceFile;
  version: string;
}

export default class SourceCache {
  private bucketKey: ts.DocumentRegistryBucketKey;

  private sourceFiles = new Map<Path, VersionedSourceFile>();

  constructor( private resolver: PathResolver, private options: ts.CompilerOptions) {
    this.bucketKey = SharedRegistry.getKeyForCompilationSettings(options);
  }

  public updateOptions(options: ts.CompilerOptions) {
    const bucketKey = SharedRegistry.getKeyForCompilationSettings(options);
    this.options = options;
    if (this.bucketKey !== bucketKey) {
      this.releaseAll();
      this.bucketKey = bucketKey;
    }
  }

  public getSourceFile(fileName: string): ts.SourceFile | undefined {
    const resolution = this.resolve(fileName);
    return this.getSourceFileByPath(fileName, resolution.path);
  }

  public getSourceFileByPath(fileName: string, path: Path): ts.SourceFile | undefined {
    const resolution = this.resolve(path);
    return this.getSourceFileByResolution(resolution, fileName, path);
  }

  public releaseUnusedSourceFiles(program: ts.Program) {
    const bucketKey = this.bucketKey;
    for (const path of this.sourceFiles.keys()) {
      if (program.getSourceFileByPath(path) === undefined) {
        SharedRegistry.releaseDocumentWithKey(path, bucketKey);
      }
    }
  }

  public releaseAll() {
    const { bucketKey } = this;
    const paths = this.sourceFiles.keys();
    for (const path of paths) {
      SharedRegistry.releaseDocumentWithKey(path, bucketKey);
    }
    this.sourceFiles.clear();
  }

  private resolve(fileName: string) {
    return this.resolver.resolve(fileName);
  }

  private getSourceFileByResolution(resolution: Resolution, fileName: string, path: Path): ts.SourceFile | undefined {
    const content = readFileResolution(resolution);
    if (content) {
      return this.getOrUpdateSourceFile(fileName, path, content);
    }
  }

  private getOrUpdateSourceFile(fileName: string, path: Path, content: FileContent) {
    const existing = this.sourceFiles.get(path);
    if (existing) {
      return this.updateSourceFile(existing, fileName, path, content);
    } else {
      return this.createSourceFile(fileName, path, content);
    }
  }

  private updateSourceFile(existing: VersionedSourceFile, fileName: string, path: Path, content: FileContent) {
    const { version } = content;
    if (existing.version === version) {
      return existing.sourceFile;
    }
    const { options, bucketKey } = this;
    const sourceFile = SharedRegistry.updateDocumentWithKey(
      fileName, path, options, bucketKey, snapshot(content.buffer), version);
    existing.sourceFile = sourceFile;
    existing.version = version;
    return sourceFile;
  }

  private createSourceFile(fileName: string, path: Path, content: FileContent) {
    const { options, bucketKey, sourceFiles } = this;
    const { buffer, version } = content;
    const sourceFile = SharedRegistry.acquireDocumentWithKey(
        fileName, path, options, bucketKey, snapshot(buffer), version);
    sourceFiles.set(path, { sourceFile, version });
    return sourceFile;
  }
}

function snapshot(buffer: Buffer) {
  return ts.ScriptSnapshot.fromString(buffer.toString("utf8"));
}
