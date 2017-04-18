import Cache from "../cache";
import { Path, PathInfo, Resolution } from "../interfaces";
import ResolutionCacheDelegate from "./resolution-cache-delegate";

export default class ResolutionCache extends Cache<PathInfo, Path, Resolution> {
  constructor() {
    super(new ResolutionCacheDelegate());
  }
}
