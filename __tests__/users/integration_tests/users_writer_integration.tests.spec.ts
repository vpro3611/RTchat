import { Pool, PoolClient } from "pg";
import { UserRepoWriterPg } from "../../../src/modules/users/repositories/user_repo_writer_pg";
import { User } from "../../../src/modules/users/domain/user";
import { Username } from "../../../src/modules/users/domain/Username";
import { Email } from "../../../src/modules/users/domain/email";
import { Password } from "../../../src/modules/users/domain/password";

describe("UserRepoWriterPg (integration - transactional)", () => {
    let pool: Pool;
    let client: PoolClient;
    let repo: UserRepoWriterPg;

    beforeAll(async () => {
        pool = new Pool({
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

        repo = new UserRepoWriterPg(client);
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    function createTestUser(overrides?: Partial<{
        id: string;
        username: string;
        email: string;
        passwordHash: string;
        is_active: boolean;
        is_verified: boolean;
        last_seen_at: Date | null;
        created_at: Date;
        updated_at: Date;
    }>): User {
        return User.restore(
            overrides?.id ?? "11111111-1111-1111-1111-111111111111",
            overrides?.username ?? "testuser",
            overrides?.email ?? "test@example.com",
            overrides?.passwordHash ?? "hash123",
            overrides?.is_active ?? true,
            overrides?.is_verified ?? true,
            overrides?.last_seen_at ?? new Date(),
            overrides?.created_at ?? new Date(),
            overrides?.updated_at ?? new Date(),
        );
    }

    it("should insert new user", async () => {
        const user = createTestUser();

        const saved = await repo.save(user);

        const result = await client.query(
            "SELECT * FROM users WHERE id = $1",
            [user.id]
        );

        expect(result.rows.length).toBe(1);
        expect(saved.id).toBe(user.id);
        expect(saved.getUsername().getValue()).toBe("testuser");
    });

    it("should update existing user (upsert)", async () => {
        const user = createTestUser();
        await repo.save(user);

        const updatedUser = createTestUser({
            id: user.id,
            username: "updateduser",
            email: "test@example.com",
        });

        const saved = await repo.save(updatedUser);

        expect(saved.getUsername().getValue()).toBe("updateduser");

        const result = await client.query(
            "SELECT username FROM users WHERE id = $1",
            [user.id]
        );

        expect(result.rows[0].username).toBe("updateduser");
    });

    it("should throw USERNAME_ALREADY_EXISTS", async () => {
        const user1 = createTestUser({
            id: "11111111-1111-1111-1111-111111111111",
            username: "duplicateuser",
        });

        const user2 = createTestUser({
            id: "22222222-2222-2222-2222-222222222222",
            username: "duplicateuser",
        });

        await repo.save(user1);

        await expect(repo.save(user2))
            .rejects
            .toThrow("USERNAME_ALREADY_EXISTS");
    });

    it("should throw DATABASE_QUERY_ERROR", async () => { // the contract has changed, and now we do not have invalid uuid
        const user = createTestUser({
            id: "invalid-query",
            email: "invalidquery@test.com",
        });

        await expect(repo.save(user))
            .rejects
            .toThrow("DATABASE_QUERY_ERROR");
    });

    it("should mark user as verified", async () => {
        const user = createTestUser({
            is_verified: false,
        });

        await repo.save(user);

        await repo.markAsVerified(user.id);

        const result = await client.query(
            "SELECT is_verified FROM users WHERE id = $1",
            [user.id]
        );

        expect(result.rows[0].is_verified).toBe(true);
    });
});