import Cache from "../cache";
import { DirEntries, Path, PathResolver } from "../interfaces";
import DirEntriesCacheDelegate from "./directory-entries-cache-delegate";

export default class DirEntriesCache extends Cache<Path, Path, DirEntries> {
  constructor(resolver: PathResolver) {
    super(new DirEntriesCacheDelegate(resolver));
  }
}
