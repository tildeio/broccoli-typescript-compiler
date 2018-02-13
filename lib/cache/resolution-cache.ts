import Cache from "../cache";
import { CanonicalPath, PathInfo, Resolution } from "../interfaces";
import ResolutionCacheDelegate from "./resolution-cache-delegate";

export default class ResolutionCache extends Cache<PathInfo, CanonicalPath, Resolution> {
  constructor() {
    super(new ResolutionCacheDelegate());
  }
}
