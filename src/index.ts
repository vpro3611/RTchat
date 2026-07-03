import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

import { startServer } from "./server";
import { connectRedis } from "./modules/infrasctructure/ports/cache_service/connect_reddis";

async function main() {
  await connectRedis();
  await startServer();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
