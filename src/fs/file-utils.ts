import { createHash } from "crypto";
import { readdirSync, readFileSync, Stats, statSync } from "fs";
import {
  AbsolutePath,
  CanonicalPath,
  DirEntries,
  FileContent,
  PathResolver,
  Resolution,
} from "../interfaces";

interface CodedError extends Error {
  code: string;
}

function isCodedError(value: unknown): value is CodedError {
  return (
    value instanceof Error && typeof (value as CodedError).code === "string"
  );
}

export function readFile(path: AbsolutePath): FileContent {
  const buffer = readFileSync(path);
  const hash = createHash("sha1");
  hash.update(buffer);
  return { buffer, version: hash.digest("hex") };
}

export function readFileResolution(resolution: Resolution) {
  let path: AbsolutePath | undefined;
  if (resolution.isFile()) {
    if (resolution.isInput()) {
      path = resolution.pathInInput;
    } else {
      path = resolution.path;
    }
  }
  if (path) {
    return readFile(path);
  }
}

export function stat(path: AbsolutePath): Stats | undefined {
  try {
    return statSync(path);
  } catch (e) {
    if (isCodedError(e) && (e.code === "ENOENT" || e.code === "EACCES")) {
      return;
    }
    throw e;
  }
}

export function readdir(
  path: CanonicalPath,
  resolver: PathResolver
): DirEntries {
  const prefix = path + "/";
  const files: string[] = [];
  const directories: string[] = [];
  for (const entry of readdirSync(path).sort()) {
    const resolution = resolver.resolve(prefix + entry);
    if (resolution.isFile()) {
      files.push(entry);
    } else if (resolution.isDirectory()) {
      directories.push(entry);
    }
  }
  return { files, directories };
}
