"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
class CacheService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async get(key) {
        const value = await this.redis.get(key);
        if (!value) {
            return null;
        }
        return JSON.parse(value);
    }
    async set(key, value, ttl = 60) {
        const serialized = JSON.stringify(value);
        await this.redis.set(key, serialized, { EX: ttl });
    }
    async update(key, value, ttl) {
        const serialized = JSON.stringify(value);
        if (ttl) {
            await this.redis.set(key, serialized, { EX: ttl });
        }
        else {
            await this.redis.set(key, serialized);
        }
    }
    async del(key) {
        await this.redis.del(key);
    }
    async remember(key, ttl, callback) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const result = await callback();
        await this.set(key, result, ttl);
        return result;
    }
    async delByPattern(pattern) {
        const keys = [];
        for await (const chunk of this.redis.scanIterator({
            MATCH: pattern,
            COUNT: 100
        })) {
            if (Array.isArray(chunk)) {
                keys.push(...chunk);
            }
        }
        if (keys.length > 0) {
            await this.redis.del(keys);
        }
    }
}
exports.CacheService = CacheService;
