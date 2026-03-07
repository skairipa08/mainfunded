import { logger } from './logger';

interface CacheItem<T> {
    value: T;
    expiry: number;
}

class MemoryCache {
    private cache = new Map<string, CacheItem<any>>();

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value as T;
    }

    set<T>(key: string, value: T, ttlSeconds: number = 60): void {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttlSeconds * 1000,
        });
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

// Global instance to survive HMR in dev
const globalForCache = global as unknown as { cache: MemoryCache };
export const cache = globalForCache.cache || new MemoryCache();

if (process.env.NODE_ENV !== 'production') globalForCache.cache = cache;
