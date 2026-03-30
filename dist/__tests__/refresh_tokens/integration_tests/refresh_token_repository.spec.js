"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const refresh_token_repo_pg_1 = require("../../../src/modules/authentification/refresh_token_repo/refresh_token_repo_pg");
const crypto_1 = require("crypto");
describe("RefreshTokenRepoPg (integration - transactional)", () => {
    let pool;
    let client;
    let repo;
    const userId = "11111111-1111-1111-1111-111111111111";
    beforeAll(async () => {
        pool = new pg_1.Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });
    });
    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");
        // Clean up before test
        await client.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
        repo = new refresh_token_repo_pg_1.RefreshTokenRepoPg(client);
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
        const tokenId = (0, crypto_1.randomUUID)();
        await repo.create({
            id: tokenId,
            userId,
            tokenHash: "hash123",
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });
        const result = await client.query("SELECT * FROM refresh_tokens WHERE id = $1", [tokenId]);
        expect(result.rows.length).toBe(1);
    });
    it("should find valid token by hash", async () => {
        const tokenId = (0, crypto_1.randomUUID)();
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
        const tokenId = (0, crypto_1.randomUUID)();
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
        const tokenId = (0, crypto_1.randomUUID)();
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
        const tokenId = (0, crypto_1.randomUUID)();
        const hash = "revokeById";
        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });
        await repo.revoke(tokenId);
        const result = await client.query("SELECT revoked_at FROM refresh_tokens WHERE id = $1", [tokenId]);
        expect(result.rows[0].revoked_at).not.toBeNull();
    });
    it("should revoke by hash", async () => {
        const tokenId = (0, crypto_1.randomUUID)();
        const hash = "revokeByHash";
        await repo.create({
            id: tokenId,
            userId,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });
        await repo.revokeByHash(hash);
        const result = await client.query("SELECT revoked_at FROM refresh_tokens WHERE token_hash = $1", [hash]);
        expect(result.rows[0].revoked_at).not.toBeNull();
    });
    it("should find token by hash (even if revoked)", async () => {
        const tokenId = (0, crypto_1.randomUUID)();
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
