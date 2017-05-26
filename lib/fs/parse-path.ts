import { Path, PathInfo } from "../interfaces";
import { relativePathWithin, toPath } from "./path-utils";

export default function parsePath(rootPath: Path, inputPath: Path, rawPath: string): PathInfo {
  let path = toPath(rawPath, rootPath);
  let pathInInput: Path | undefined;
  let relativePath = relativePathWithin(rootPath, path);
  if (relativePath === undefined) {
    relativePath = relativePathWithin(inputPath, path);
    if (relativePath !== undefined) {
      pathInInput = path;
      path = toPath(relativePath, rootPath);
    }
  } else {
    pathInInput = toPath(relativePath, inputPath);
  }
  return {
    path,
    pathInInput,
    relativePath,
  };
}
