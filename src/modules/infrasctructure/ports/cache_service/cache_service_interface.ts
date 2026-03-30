

export interface CacheServiceInterface {
    remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T>;
    update<T>(key: string, value: T, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    delByPattern(pattern: string): Promise<void>;
}