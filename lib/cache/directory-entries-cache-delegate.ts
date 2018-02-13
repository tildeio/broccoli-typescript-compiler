import { readdir } from "../fs/file-utils";
import { CacheDelegate, CanonicalPath, DirEntries, PathResolver } from "../interfaces";

export default class DirEntriesCacheDelegate implements CacheDelegate<CanonicalPath, CanonicalPath, DirEntries> {
  constructor(private resolver: PathResolver) {}

  public cacheKey(path: CanonicalPath): CanonicalPath {
    return path;
  }

  public create(path: CanonicalPath): DirEntries {
    return readdir(path, this.resolver);
  }
}
