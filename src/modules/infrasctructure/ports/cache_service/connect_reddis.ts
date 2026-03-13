import {redisClient} from "./reddis_client";

export async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Redis connected");
    } catch (error) {
        console.error("Error connecting to Redis:", error);
        await redisClient.quit();
        process.exit(1);
    }
}