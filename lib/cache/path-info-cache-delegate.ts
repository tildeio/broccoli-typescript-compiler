import parsePath from "../fs/parse-path";
import { toCanonicalPath } from "../fs/path-utils";
import { AbsolutePath, CacheDelegate, CanonicalPath, PathInfo} from "../interfaces";

export default class PathInfoCacheDelegate implements CacheDelegate<string, CanonicalPath, PathInfo> {
  constructor(private rootPath: AbsolutePath, private inputPath: AbsolutePath) {
  }

  public cacheKey(key: string): CanonicalPath {
    return toCanonicalPath(key, this.rootPath);
  }

  public create(key: string) {
    return parsePath(this.rootPath, this.inputPath, key);
  }
}
