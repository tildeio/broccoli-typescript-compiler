import resolve from "../fs/resolve";
import { CacheDelegate, Path, PathInfo, Resolution} from "../interfaces";

export default class ResolutionCacheDelegate implements CacheDelegate<PathInfo, Path, Resolution> {
  public cacheKey(pathInfo: PathInfo): Path {
    return pathInfo.path;
  }

  public create(pathInfo: PathInfo) {
    return resolve(pathInfo);
  }
}
