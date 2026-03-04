import { Pool, PoolClient } from "pg";
import { RefreshTokenRepoPg } from "../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg";
import { randomUUID } from "crypto";

describe("RefreshTokenRepoPg (integration - transactional)", () => {
    let pool: Pool;
    let client: PoolClient;
    let repo: RefreshTokenRepoPg;

    const userId = "11111111-1111-1111-1111-111111111111";

    beforeAll(async () => {
        pool = new Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });
    });

    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");

        repo = new RefreshTokenRepoPg(client);

        // создаём тестового юзера (FK требует)
        await client.query(`
            INSERT INTO users (
                id, username, email, password_hash,
                is_active, is_verified,
                last_seen_at, created_at, updated_at
            )
            VALUES ($1, 'test', 'test@test.com', 'hash', true, true, NOW(), NOW(), NOW())
        `, [userId]);
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should create refresh token", async () => {
        const tokenId = randomUUID();

        await repo.create({
            id: tokenId,
            userId,
            tokenHash: "hash123",
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });

        const result = await client.query(
            "SELECT * FROM refresh_tokens WHERE id = $1",
            [tokenId]
        );

        expect(result.rows.length).toBe(1);
    });

    it("should find valid token by hash", async () => {
        const tokenId = randomUUID();
        const hash = "validhash";

        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });

        const token = await repo.findValidByHash(hash);

        expect(token).not.toBeNull();
        expect(token?.tokenHash).toBe(hash);
    });

    it("should return null if token expired", async () => {
        const tokenId = randomUUID();
        const hash = "expiredhash";

        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() - 1000),
        });

        const token = await repo.findValidByHash(hash);

        expect(token).toBeNull();
    });

    it("should return null if token revoked", async () => {
        const tokenId = randomUUID();
        const hash = "revokedhash";

        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });

        await repo.revoke(tokenId);

        const token = await repo.findValidByHash(hash);

        expect(token).toBeNull();
    });

    it("should revoke by id", async () => {
        const tokenId = randomUUID();
        const hash = "revokeById";

        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });

        await repo.revoke(tokenId);

        const result = await client.query(
            "SELECT revoked_at FROM refresh_tokens WHERE id = $1",
            [tokenId]
        );

        expect(result.rows[0].revoked_at).not.toBeNull();
    });

    it("should revoke by hash", async () => {
        const tokenId = randomUUID();
        const hash = "revokeByHash";

        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });

        await repo.revokeByHash(hash);

        const result = await client.query(
            "SELECT revoked_at FROM refresh_tokens WHERE token_hash = $1",
            [hash]
        );

        expect(result.rows[0].revoked_at).not.toBeNull();
    });

    it("should find token by hash (even if revoked)", async () => {
        const tokenId = randomUUID();
        const hash = "findByHash";

        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });

        await repo.revoke(tokenId);

        const token = await repo.findByHash(hash);

        expect(token).not.toBeNull();
        expect(token?.tokenHash).toBe(hash);
    });
});