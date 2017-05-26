import { CacheDelegate } from "./interfaces";

export default class Cache<K, CK, V> {
  public hits = 0;
  public misses = 0;
  private store = new Map<CK, V>();
  constructor(private delegate: CacheDelegate<K, CK, V>) {
  }

  public get(key: K): V {
    const cacheKey = this.delegate.cacheKey(key);
    let value = this.store.get(cacheKey);
    if (value === undefined) {
      this.misses++;
      value = this.delegate.create(key);
      this.store.set(cacheKey, value);
    } else {
      this.hits++;
    }
    return value;
  }

  public clear() {
    this.store.clear();
  }
}
