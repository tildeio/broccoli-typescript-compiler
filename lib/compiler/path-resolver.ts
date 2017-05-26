import PathInfoCache from "../cache/path-info-cache";
import ResolutionCache from "../cache/resolution-cache";
import { Path, PathResolver, Resolution } from "../interfaces";

export default class PathResolverImpl implements PathResolver {
  private pathInfoCache: PathInfoCache;
  private resolutionCache = new ResolutionCache();

  constructor(rootPath: Path, inputPath: Path) {
    this.pathInfoCache = new PathInfoCache(rootPath, inputPath);
  }

  public resolve(path: string): Resolution {
    const pathInfo = this.pathInfoCache.get(path);
    return this.resolutionCache.get(pathInfo);
  }

  public reset() {
    // PathInfo cache is not build specific
    // resolutions are
    this.resolutionCache.clear();
  }
}
