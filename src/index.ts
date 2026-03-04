import {pool} from "./database";
import {AccessTokenPayload} from "./modules/authentification/payloads/payloads";

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

console.log('Happy developing ✨')


async function main() {
    console.log(process.env.DATABASE_URL)
    const res = await pool.query('SELECT NOW()');
    console.log(res.rows[0]);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});