import parsePath from "../fs/parse-path";
import { CacheDelegate, Path, PathInfo} from "../interfaces";

export default class PathInfoCacheDelegate implements CacheDelegate<string, string, PathInfo> {
  constructor(private rootPath: Path, private inputPath: Path) {
  }

  public cacheKey(key: string): string {
    return key;
  }

  public create(key: string) {
    return parsePath(this.rootPath, this.inputPath, key);
  }
}
