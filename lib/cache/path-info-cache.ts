import Cache from "../cache";
import { AbsolutePath, CanonicalPath, PathInfo } from "../interfaces";
import PathInfoCacheDelegate from "./path-info-cache-delegate";

export default class PathInfoCache extends Cache<string, CanonicalPath, PathInfo> {
  constructor(rootPath: AbsolutePath, inputPath: AbsolutePath) {
    super(new PathInfoCacheDelegate(rootPath, inputPath));
  }
}
