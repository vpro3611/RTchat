import { createClient } from 'redis';
import dotenv from 'dotenv';


dotenv.config();

export const redisClient = createClient(
    {
        url: process.env.REDIS_URL || 'redis://redis:6379',
        socket: {
            connectTimeout: 10000,
            reconnectStrategy: (retries) => {
                const delay = Math.min(retries * 500, 3000);
                console.log(`Retrying Redis connection in ${delay}ms... (Attempt ${retries})`);
                return delay;
            }
        }
    }
)

export type TypeRedisClient = ReturnType<typeof createClient>;

redisClient.on('error', (err) => {
    if ((err as any).code === 'EAI_AGAIN' || (err as any).code === 'ENOTFOUND') {
        console.error('Redis DNS resolution failed (hostname not found yet). This is normal during initial startup and will retry.');
    } else {
        console.error('Redis Client Error:', err);
    }
})




