"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
const reddis_client_1 = require("./reddis_client");
async function connectRedis() {
    try {
        await reddis_client_1.redisClient.connect();
        console.log("Redis connected");
    }
    catch (error) {
        console.error("Error connecting to Redis:", error);
        await reddis_client_1.redisClient.quit();
        process.exit(1);
    }
}
