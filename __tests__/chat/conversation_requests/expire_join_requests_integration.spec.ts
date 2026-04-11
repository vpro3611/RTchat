import { Pool, PoolClient } from "pg";
import { ConversationRequestsRepositoryPg } from "../../../src/modules/chat/repositories_pg_realization/conversation_requests_repository_pg";
import { CryptoEncryptionService } from "../../../src/modules/infrasctructure/crypto_encryption_service";
import * as crypto from "crypto";

describe("ExpireJoinRequests Integration", () => {
    let pool: Pool;
    let client: PoolClient;
    let repo: ConversationRequestsRepositoryPg;
    let encryptionService: CryptoEncryptionService;

    const USER_ID_1 = "11111111-1111-1111-1111-111111111111";
    const USER_ID_2 = "33333333-3333-3333-3333-333333333333";
    const CONV_ID = "22222222-2222-2222-2222-222222222222";
    const TEST_KEY = crypto.randomBytes(32).toString('hex');

    beforeAll(async () => {
        pool = new Pool({
            connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
        });
        encryptionService = new CryptoEncryptionService(TEST_KEY);
    });

    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");

        // Clean up (order matters for FK)
        await client.query(`DELETE FROM conversation_join_requests`);
        await client.query(`DELETE FROM conversations`);
        await client.query(`DELETE FROM users`);

        repo = new ConversationRequestsRepositoryPg(client, encryptionService);

        // Setup Users and Conversation
        await client.query(`
            INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
            VALUES 
            ($1, 'testuser1', 'test1@test.com', 'hash', true, true, NOW(), NOW()),
            ($2, 'testuser2', 'test2@test.com', 'hash', true, true, NOW(), NOW())
        `, [USER_ID_1, USER_ID_2]);

        await client.query(`
            INSERT INTO conversations (id, conversation_type, title, created_by, created_at)
            VALUES ($1, 'group', 'Test Group', $2, NOW())
        `, [CONV_ID, USER_ID_1]);
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should expire requests older than 7 days", async () => {
        const expiredId = crypto.randomUUID();
        const pendingId = crypto.randomUUID();
        const encryptedMsg = encryptionService.encrypt("Hello");

        // Request older than 7 days (8 days ago)
        await client.query(`
            INSERT INTO conversation_join_requests (id, conversation_id, user_id, status, request_message, submitted_at)
            VALUES ($1, $2, $3, 'pending', $4, NOW() - INTERVAL '8 days')
        `, [expiredId, CONV_ID, USER_ID_1, encryptedMsg]);

        // Request newer than 7 days (6 days ago)
        await client.query(`
            INSERT INTO conversation_join_requests (id, conversation_id, user_id, status, request_message, submitted_at)
            VALUES ($1, $2, $3, 'pending', $4, NOW() - INTERVAL '6 days')
        `, [pendingId, CONV_ID, USER_ID_2, encryptedMsg]);

        const expiredCount = await repo.expireRequests();

        expect(expiredCount).toBe(1);

        const resultExpired = await client.query("SELECT status FROM conversation_join_requests WHERE id = $1", [expiredId]);
        expect(resultExpired.rows[0].status).toBe('expired');

        const resultPending = await client.query("SELECT status FROM conversation_join_requests WHERE id = $1", [pendingId]);
        expect(resultPending.rows[0].status).toBe('pending');
    });

    it("should not expire non-pending requests", async () => {
        const acceptedId = crypto.randomUUID();
        const encryptedMsg = encryptionService.encrypt("Hello");

        // Accepted request older than 7 days (8 days ago)
        await client.query(`
            INSERT INTO conversation_join_requests (id, conversation_id, user_id, status, request_message, submitted_at)
            VALUES ($1, $2, $3, 'accepted', $4, NOW() - INTERVAL '8 days')
        `, [acceptedId, CONV_ID, USER_ID_1, encryptedMsg]);

        const expiredCount = await repo.expireRequests();

        expect(expiredCount).toBe(0);

        const result = await client.query("SELECT status FROM conversation_join_requests WHERE id = $1", [acceptedId]);
        expect(result.rows[0].status).toBe('accepted');
    });

});
