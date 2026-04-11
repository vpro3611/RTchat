import {redisClient} from "./reddis_client";

export async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Redis connected successfully");
    } catch (error) {
        console.error("Initial Redis connection attempt failed:", error);
        console.log("Redis will continue attempting to connect in the background...");
    }
}