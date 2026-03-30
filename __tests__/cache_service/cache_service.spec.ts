import { CacheService } from "../../src/modules/infrasctructure/ports/cache_service/cache_service";

describe("CacheService", () => {

    let redis: any;
    let cache: CacheService;

    beforeEach(() => {

        redis = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            multi: jest.fn(),
            scanIterator: jest.fn()
        };

        cache = new CacheService(redis);
    });

    // =========================
    // get
    // =========================

    it("should return parsed value from cache", async () => {

        redis.get.mockResolvedValue(JSON.stringify({ name: "John" }));

        const result = await cache.get("user:1");

        expect(redis.get).toHaveBeenCalledWith("user:1");

        expect(result).toEqual({ name: "John" });
    });

    it("should return null if value not found", async () => {

        redis.get.mockResolvedValue(null);

        const result = await cache.get("missing");

        expect(result).toBeNull();
    });

    // =========================
    // set
    // =========================

    it("should set value with ttl", async () => {

        await cache.set("key", { a: 1 }, 120);

        expect(redis.set).toHaveBeenCalledWith(
            "key",
            JSON.stringify({ a: 1 }),
            { EX: 120 }
        );
    });

    // =========================
    // update
    // =========================

    it("should update value with ttl", async () => {

        await cache.update("key", { a: 2 }, 300);

        expect(redis.set).toHaveBeenCalledWith(
            "key",
            JSON.stringify({ a: 2 }),
            { EX: 300 }
        );
    });

    it("should update value without ttl", async () => {

        await cache.update("key", { a: 2 });

        expect(redis.set).toHaveBeenCalledWith(
            "key",
            JSON.stringify({ a: 2 })
        );
    });

    // =========================
    // del
    // =========================

    it("should delete key", async () => {

        await cache.del("user:1");

        expect(redis.del).toHaveBeenCalledWith("user:1");
    });

    // =========================
    // remember
    // =========================

    it("should return cached value if exists", async () => {

        redis.get.mockResolvedValue(JSON.stringify({ value: 10 }));

        const callback = jest.fn();

        const result = await cache.remember(
            "key",
            60,
            callback
        );

        expect(callback).not.toHaveBeenCalled();

        expect(result).toEqual({ value: 10 });
    });

    it("should call callback if cache miss", async () => {

        redis.get.mockResolvedValue(null);

        const callback = jest.fn().mockResolvedValue({ value: 20 });

        const result = await cache.remember(
            "key",
            60,
            callback
        );

        expect(callback).toHaveBeenCalled();

        expect(redis.set).toHaveBeenCalled();

        expect(result).toEqual({ value: 20 });
    });

    // =========================
    // delByPattern
    // =========================

    it("should delete keys by pattern", async () => {

        redis.scanIterator.mockReturnValue([
            ["user:1", "user:2"]
        ]);
        redis.del.mockResolvedValue(2);

        await cache.delByPattern("user:*");

        expect(redis.del).toHaveBeenCalledWith(["user:1", "user:2"]);
    });

});