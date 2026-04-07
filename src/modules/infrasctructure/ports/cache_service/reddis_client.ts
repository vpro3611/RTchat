import { createClient } from 'redis';
import dotenv from 'dotenv';


dotenv.config();

export const redisClient = createClient(
    {
        url: process.env.REDIS_URL,
        socket: {
            connectTimeout: 10000,
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    return new Error('Redis maximum retries reached');
                }
                return Math.min(retries * 100, 3000);
            }
        }
    }
)

export type TypeRedisClient = ReturnType<typeof createClient>;

redisClient.on('error', (err) => {
    console.log('Redis Client Error Fatal', err)
    process.exit(1)
})




