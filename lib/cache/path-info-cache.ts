import Cache from "../cache";
import { Path, PathInfo } from "../interfaces";
import PathInfoCacheDelegate from "./path-info-cache-delegate";

export default class PathInfoCache extends Cache<string, string, PathInfo> {
  constructor(rootPath: Path, inputPath: Path) {
    super(new PathInfoCacheDelegate(rootPath, inputPath));
  }
}
