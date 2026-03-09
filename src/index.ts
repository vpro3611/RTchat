import {startServer} from "./server";
import {connectRedis} from "./modules/infrasctructure/ports/cache_service/connect_reddis";



console.log('Happy developing ✨')


async function main() {
    await connectRedis();
    await startServer();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});