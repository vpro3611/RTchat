import { Pool, PoolClient } from "pg";
import { ConversationBansRepositoryPg } from "../../../../src/modules/chat/repositories_pg_realization/conversation_bans_repository_pg";
import { ConversationBans } from "../../../../src/modules/chat/domain/conversation_bans/conversation_bans";

describe("ConversationBansRepositoryPg (integration)", () => {

    let pool: Pool;
    let client: PoolClient;
    let repo: ConversationBansRepositoryPg;

    const USER_A = "11111111-1111-1111-1111-111111111111";
    const USER_B = "22222222-2222-2222-2222-222222222222";
    const USER_C = "33333333-3333-3333-3333-333333333333";

    const CONVERSATION_ID = "44444444-4444-4444-4444-444444444444";

    beforeAll(async () => {
        pool = new Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });
    });

    beforeEach(async () => {

        client = await pool.connect();
        await client.query("BEGIN");

        // Clean up before test
        await client.query(`DELETE FROM conversation_bans WHERE conversation_id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM conversation_participants WHERE conversation_id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM conversations WHERE id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM users WHERE id IN ($1, $2, $3)`, [USER_A, USER_B, USER_C]);

        repo = new ConversationBansRepositoryPg(client);

        // users
        await client.query(`
            INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
            VALUES
                ($1,'userA','a@test.com','hash',true,true,NOW(),NOW()),
                ($2,'userB','b@test.com','hash',true,true,NOW(),NOW()),
                ($3,'userC','c@test.com','hash',true,true,NOW(),NOW())
        `, [USER_A, USER_B, USER_C]);

        // conversation
        await client.query(`
            INSERT INTO conversations
            (id, conversation_type, title, created_by, created_at, last_message_at, user_low, user_high)
            VALUES ($1,'group','Test Group', $2, NOW(), NULL, $2, $3)
        `, [CONVERSATION_ID, USER_A, USER_B]);

    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    function createBan(userId: string, bannedBy: string, reason: string): ConversationBans {
        return {
            conversationId: CONVERSATION_ID,
            userId: userId,
            bannedBy: bannedBy,
            createdAt: new Date(),
            reason: reason,
        };
    }

    // =========================
    // isBanned
    // =========================

    describe("isBanned", () => {
        it("should return false when user is not banned", async () => {
            const result = await repo.isBanned(CONVERSATION_ID, USER_B);
            expect(result).toBe(false);
        });

        it("should return true when user is banned", async () => {
            const ban = createBan(USER_B, USER_A, "Spam");
            await repo.ban(ban);

            const result = await repo.isBanned(CONVERSATION_ID, USER_B);
            expect(result).toBe(true);
        });

        it("should return false for different conversation", async () => {
            const ban = createBan(USER_B, USER_A, "Spam");
            await repo.ban(ban);

            const result = await repo.isBanned("different-conv-id", USER_B);
            expect(result).toBe(false);
        });

        it("should return false for different user in same conversation", async () => {
            const ban = createBan(USER_B, USER_A, "Spam");
            await repo.ban(ban);

            const result = await repo.isBanned(CONVERSATION_ID, USER_C);
            expect(result).toBe(false);
        });
    });

    // =========================
    // ban
    // =========================

    describe("ban", () => {
        it("should ban user successfully", async () => {
            const ban = createBan(USER_B, USER_A, "Spam behavior");

            await repo.ban(ban);

            const result = await client.query(
                `SELECT * FROM conversation_bans WHERE conversation_id = $1 AND user_id = $2`,
                [CONVERSATION_ID, USER_B]
            );

            expect(result.rows.length).toBe(1);
            expect(result.rows[0].user_id).toBe(USER_B);
            expect(result.rows[0].banned_by).toBe(USER_A);
            expect(result.rows[0].reason).toBe("Spam behavior");
        });

        it("should allow banning same user in different conversations", async () => {
            const ban1 = createBan(USER_B, USER_A, "Reason 1");
            const ban2 = createBan(USER_B, USER_A, "Reason 2");

            await repo.ban(ban1);

            // Create different conversation
            const CONV2 = "55555555-5555-5555-5555-555555555555";
            await client.query(`
                INSERT INTO conversations
                (id, conversation_type, title, created_by, created_at, last_message_at, user_low, user_high)
                VALUES ($1,'group','Test Group 2', $2, NOW(), NULL, $2, $3)
            `, [CONV2, USER_A, USER_B]);

            const ban2DifferentConv = { ...ban2, conversationId: CONV2 };
            await repo.ban(ban2DifferentConv);

            const result1 = await client.query(
                `SELECT * FROM conversation_bans WHERE conversation_id = $1`,
                [CONVERSATION_ID]
            );
            const result2 = await client.query(
                `SELECT * FROM conversation_bans WHERE conversation_id = $1`,
                [CONV2]
            );

            expect(result1.rows.length).toBe(1);
            expect(result2.rows.length).toBe(1);
        });

        it("should throw on duplicate ban (same user, same conversation)", async () => {
            const ban1 = createBan(USER_B, USER_A, "First ban");
            const ban2 = createBan(USER_B, USER_A, "Second ban");

            await repo.ban(ban1);

            await expect(repo.ban(ban2)).rejects.toThrow();
        });
    });

    // =========================
    // unban
    // =========================

    describe("unban", () => {
        it("should unban user successfully", async () => {
            const ban = createBan(USER_B, USER_A, "Spam");
            await repo.ban(ban);

            await repo.unban(CONVERSATION_ID, USER_B);

            const result = await client.query(
                `SELECT * FROM conversation_bans WHERE conversation_id = $1 AND user_id = $2`,
                [CONVERSATION_ID, USER_B]
            );

            expect(result.rows.length).toBe(0);
        });

        it("should not throw when trying to unban non-banned user", async () => {
            await expect(
                repo.unban(CONVERSATION_ID, USER_C)
            ).resolves.not.toThrow();
        });

        it("should only unban specific user in specific conversation", async () => {
            const banB = createBan(USER_B, USER_A, "Ban B");
            const banC = createBan(USER_C, USER_A, "Ban C");

            await repo.ban(banB);
            await repo.ban(banC);

            await repo.unban(CONVERSATION_ID, USER_B);

            const resultB = await client.query(
                `SELECT * FROM conversation_bans WHERE user_id = $1`,
                [USER_B]
            );
            const resultC = await client.query(
                `SELECT * FROM conversation_bans WHERE user_id = $1`,
                [USER_C]
            );

            expect(resultB.rows.length).toBe(0);
            expect(resultC.rows.length).toBe(1);
        });
    });

    // =========================
    // getBannedUsers
    // =========================

    describe("getBannedUsers", () => {
        it("should return empty array when no bans exist", async () => {
            const result = await repo.getBannedUsers(CONVERSATION_ID);
            expect(result).toEqual([]);
        });

        it("should return all banned users in conversation", async () => {
            const banB = createBan(USER_B, USER_A, "Spam");
            const banC = createBan(USER_C, USER_A, "Harassment");

            await repo.ban(banB);
            await repo.ban(banC);

            const result = await repo.getBannedUsers(CONVERSATION_ID);

            expect(result.length).toBe(2);
            expect(result.map(b => b.userId).sort()).toEqual([USER_B, USER_C].sort());
        });

        it("should return only bans for specific conversation", async () => {
            const banB = createBan(USER_B, USER_A, "Ban in conv 1");
            await repo.ban(banB);

            // Create different conversation with ban
            const CONV2 = "66666666-6666-6666-6666-666666666666";
            await client.query(`
                INSERT INTO conversations
                (id, conversation_type, title, created_by, created_at, last_message_at, user_low, user_high)
                VALUES ($1,'group','Test Group 2', $2, NOW(), NULL, $2, $3)
            `, [CONV2, USER_A, USER_B]);

            const banBConv2 = { ...banB, conversationId: CONV2 };
            await repo.ban(banBConv2);

            const result = await repo.getBannedUsers(CONVERSATION_ID);

            expect(result.length).toBe(1);
            expect(result[0].userId).toBe(USER_B);
        });

        it("should include ban metadata (bannedBy, reason, createdAt)", async () => {
            const ban = createBan(USER_B, USER_A, "Test reason");
            await repo.ban(ban);

            const result = await repo.getBannedUsers(CONVERSATION_ID);

            expect(result.length).toBe(1);
            expect(result[0].bannedBy).toBe(USER_A);
            expect(result[0].reason).toBe("Test reason");
            expect(result[0].createdAt).toBeInstanceOf(Date);
        });
    });

    // =========================
    // Edge Cases
    // =========================

    describe("Edge Cases", () => {
        it("should handle empty conversation ID", async () => {
            const result = await repo.isBanned("", USER_B);
            expect(result).toBe(false);
        });

        it("should handle empty user ID", async () => {
            const result = await repo.isBanned(CONVERSATION_ID, "");
            expect(result).toBe(false);
        });

        it("should handle UUID format for conversation ID", async () => {
            const ban = createBan(USER_B, USER_A, "Test");
            await repo.ban(ban);

            const result = await repo.isBanned(CONVERSATION_ID, USER_B);
            expect(result).toBe(true);
        });

        it("should handle very long reason string", async () => {
            const longReason = "A".repeat(1000);
            const ban = createBan(USER_B, USER_A, longReason);
            await repo.ban(ban);

            const result = await repo.getBannedUsers(CONVERSATION_ID);

            expect(result[0].reason).toBe(longReason);
        });
    });

});
