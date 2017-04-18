import { readdir } from "../fs/file-utils";
import { CacheDelegate, DirEntries, Path, PathResolver } from "../interfaces";

export default class DirEntriesCacheDelegate implements CacheDelegate<Path, Path, DirEntries> {
  constructor(private resolver: PathResolver) {}

  public cacheKey(path: Path): Path {
    return path;
  }

  public create(path: Path): DirEntries {
    return readdir(path, this.resolver);
  }
}
