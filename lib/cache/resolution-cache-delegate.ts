import resolve from "../fs/resolve";
import { CacheDelegate, CanonicalPath, PathInfo, Resolution} from "../interfaces";

export default class ResolutionCacheDelegate implements CacheDelegate<PathInfo, CanonicalPath, Resolution> {
  public cacheKey(pathInfo: PathInfo): CanonicalPath {
    return pathInfo.canonicalPath;
  }

  public create(pathInfo: PathInfo) {
    return resolve(pathInfo);
  }
}
