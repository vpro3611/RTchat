import {pool} from "./database";
import {startServer} from "./server";



console.log('Happy developing ✨')


async function main() {
    console.log(process.env.DATABASE_URL)
    const res = await pool.query('SELECT NOW()');
    console.log(res.rows[0]);

    await startServer();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});