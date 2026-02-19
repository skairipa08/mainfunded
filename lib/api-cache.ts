/**
 * Lightweight client-side API response cache with TTL.
 *
 * Usage:
 *   import { cachedFetch } from '@/lib/api-cache';
 *   const data = await cachedFetch('/api/campaigns', fetchFn, { ttl: 60_000 });
 */

interface CacheEntry<T = unknown> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL = 60_000; // 1 minute

/**
 * Return cached data if still valid, otherwise call `fetcher` and cache result.
 *
 * @param key      Unique cache key (usually the URL).
 * @param fetcher  Async function that produces the data.
 * @param options  `ttl` in ms (default 60 000), `forceRefresh` to bypass cache.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; forceRefresh?: boolean },
): Promise<T> {
  const ttl = options?.ttl ?? DEFAULT_TTL;

  if (!options?.forceRefresh) {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
  }

  const data = await fetcher();
  store.set(key, { data, expiresAt: Date.now() + ttl });
  return data;
}

/** Invalidate a single cache key. */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/** Invalidate all keys whose prefix matches. */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/** Clear the entire cache. */
export function clearCache(): void {
  store.clear();
}
