"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const connect_reddis_1 = require("./modules/infrasctructure/ports/cache_service/connect_reddis");
async function main() {
    await (0, connect_reddis_1.connectRedis)();
    await (0, server_1.startServer)();
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
