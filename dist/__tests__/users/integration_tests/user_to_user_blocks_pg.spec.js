"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const user_to_user_blocks_pg_1 = require("../../../src/modules/users/repositories/user_to_user_blocks_pg");
describe("UserToUserBlocksPg (integration)", () => {
    let pool;
    let client;
    let repo;
    const actorId = "11111111-1111-1111-1111-111111111111";
    const targetId = "22222222-2222-2222-2222-222222222222";
    const anotherUserId = "33333333-3333-3333-3333-333333333333";
    beforeAll(async () => {
        pool = new pg_1.Pool({
            connectionString: process.env.TEST_DATABASE_URL,
        });
    });
    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");
        // Clean up related tables first (due to FK constraints)
        await client.query(`DELETE FROM conversation_reads`);
        await client.query(`DELETE FROM messages`);
        await client.query(`DELETE FROM conversation_participants`);
        await client.query(`DELETE FROM conversations`);
        await client.query(`DELETE FROM user_blocks`);
        await client.query(`DELETE FROM refresh_tokens`);
        await client.query(`DELETE FROM email_verification_tokens`);
        await client.query(`DELETE FROM users`);
        // Create test users
        await client.query(`INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, now(), now()),
                    ($7, $8, $9, $10, $11, $12, now(), now()),
                    ($13, $14, $15, $16, $17, $18, now(), now())`, [
            actorId, "actoruser", "actor@test.com", "hash1", true, true,
            targetId, "targetuser", "target@test.com", "hash2", true, true,
            anotherUserId, "anotheruser", "another@test.com", "hash3", true, true,
        ]);
        repo = new user_to_user_blocks_pg_1.UserToUserBlocksPg(client);
    });
    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });
    afterAll(async () => {
        await pool.end();
    });
    // -------------------------
    // blockSpecificUser
    // -------------------------
    it("should block user successfully", async () => {
        const result = await repo.blockSpecificUser(actorId, targetId);
        // Verify block was created - using correct table name: user_blocks
        const checkResult = await client.query("SELECT * FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2", [actorId, targetId]);
        expect(checkResult.rows.length).toBe(1);
        expect(checkResult.rows[0].blocker_id).toBe(actorId);
        expect(checkResult.rows[0].blocked_id).toBe(targetId);
    });
    it("should throw error when blocking same user twice (unique constraint)", async () => {
        await repo.blockSpecificUser(actorId, targetId);
        await expect(repo.blockSpecificUser(actorId, targetId))
            .rejects
            .toThrow();
    });
    // NOTE: Blocking non-existent user is handled at use case level
    // DB level will throw FK constraint error which is correct behavior
    // -------------------------
    // unblockSpecificUser
    // -------------------------
    it("should unblock user successfully", async () => {
        await repo.blockSpecificUser(actorId, targetId);
        await repo.unblockSpecificUser(actorId, targetId);
        // Verify block was removed - using correct table name: user_blocks
        const checkResult = await client.query("SELECT * FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2", [actorId, targetId]);
        expect(checkResult.rows.length).toBe(0);
    });
    it("should not throw when unblocking user that is not blocked", async () => {
        // Should not throw - idempotent operation
        await expect(repo.unblockSpecificUser(actorId, targetId))
            .resolves
            .toBeDefined();
    });
    // -------------------------
    // getFullBlacklist
    // -------------------------
    it("should return empty array when no users blocked", async () => {
        const result = await repo.getFullBlacklist(actorId);
        expect(result).toEqual([]);
    });
    it("should return blocked users", async () => {
        await repo.blockSpecificUser(actorId, targetId);
        await repo.blockSpecificUser(actorId, anotherUserId);
        const result = await repo.getFullBlacklist(actorId);
        expect(result.length).toBe(2);
    });
    it("should only return users blocked by specific actor", async () => {
        await repo.blockSpecificUser(actorId, targetId);
        await repo.blockSpecificUser(anotherUserId, targetId); // anotherUser blocks targetId
        const actorBlacklist = await repo.getFullBlacklist(actorId);
        const anotherBlacklist = await repo.getFullBlacklist(anotherUserId);
        expect(actorBlacklist.length).toBe(1);
        expect(anotherBlacklist.length).toBe(1);
    });
    // -------------------------
    // ensureBlockedExists
    // -------------------------
    it("should return false when block does not exist", async () => {
        const result = await repo.ensureBlockedExists(actorId, targetId);
        expect(result).toBe(false);
    });
    it("should return true when block exists", async () => {
        await repo.blockSpecificUser(actorId, targetId);
        const result = await repo.ensureBlockedExists(actorId, targetId);
        expect(result).toBe(true);
    });
    // -------------------------
    // ensureAnyBlocksExists
    // -------------------------
    it("should return false when no blocks exist between users", async () => {
        const result = await repo.ensureAnyBlocksExists(actorId, targetId);
        expect(result).toBe(false);
    });
    it("should return true when actor blocked target", async () => {
        await repo.blockSpecificUser(actorId, targetId);
        const result = await repo.ensureAnyBlocksExists(actorId, targetId);
        expect(result).toBe(true);
    });
    it("should return true when target blocked actor", async () => {
        await repo.blockSpecificUser(targetId, actorId);
        const result = await repo.ensureAnyBlocksExists(actorId, targetId);
        expect(result).toBe(true);
    });
    it("should return true regardless of which user blocked which", async () => {
        await repo.blockSpecificUser(targetId, actorId);
        const result = await repo.ensureAnyBlocksExists(actorId, targetId);
        expect(result).toBe(true);
    });
    // -------------------------
    // Edge cases
    // -------------------------
    // NOTE: Blocking self is validated at use case level, not DB level
    // DB will throw an error due to PK constraint (same blocker_id and blocked_id)
    it("should handle empty blacklist for non-existent user", async () => {
        const result = await repo.getFullBlacklist("99999999-9999-9999-9999-999999999999");
        expect(result).toEqual([]);
    });
});
