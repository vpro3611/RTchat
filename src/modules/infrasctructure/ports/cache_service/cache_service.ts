import {CacheServiceInterface} from "./cache_service_interface";
import {RedisClientType} from "redis";
import {TypeRedisClient} from "./reddis_client";

export class CacheService implements CacheServiceInterface {
    constructor(private readonly redis: TypeRedisClient) {}

    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value) as T;
    }

    async set<T>(key: string, value: T, ttl = 60): Promise<void> {
        const serialized = JSON.stringify(value);
        await this.redis.set(key, serialized, {EX: ttl});
    }

    async update<T>(key: string, value: T, ttl?: number): Promise<void> {
        const serialized = JSON.stringify(value);
        if (ttl) {
            await this.redis.set(key, serialized, {EX: ttl});
        } else {
            await this.redis.set(key, serialized);
        }
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
        const cached = await this.get<T>(key);

        if (cached !== null) {
            return cached;
        }
        const result = await callback();
        await this.set(key, result, ttl);
        return result;
    }

    async delByPattern(pattern: string) {
        const keys: string[] = [];

        for await (const chunk of this.redis.scanIterator({
            MATCH: pattern,
            COUNT: 100
        })) {
            if (Array.isArray(chunk)) {
                keys.push(...chunk);
            }
        }

        if (keys.length > 0) {
            await this.redis.del(keys)
        }
    }
}


