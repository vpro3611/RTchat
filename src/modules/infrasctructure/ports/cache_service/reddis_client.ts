import { createClient } from 'redis';
import dotenv from 'dotenv';


dotenv.config();

export const redisClient = createClient(
    {
        url: process.env.REDIS_URL,
    }
)

export type TypeRedisClient = ReturnType<typeof createClient>;

redisClient.on('error', (err) => {
    console.log('Redis Client Error Fatal', err)
    process.exit(1)
})




