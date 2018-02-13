import Cache from "../cache";
import { CanonicalPath, DirEntries, PathResolver } from "../interfaces";
import DirEntriesCacheDelegate from "./directory-entries-cache-delegate";

export default class DirEntriesCache extends Cache<CanonicalPath, CanonicalPath, DirEntries> {
  constructor(resolver: PathResolver) {
    super(new DirEntriesCacheDelegate(resolver));
  }
}
