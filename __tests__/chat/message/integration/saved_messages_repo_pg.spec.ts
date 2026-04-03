import { Pool, PoolClient } from "pg";
import { SavedMessagesRepoPg } from "../../../../src/modules/chat/repositories_pg_realization/saved_messages_repo_pg";
import { SavedMessages } from "../../../../src/modules/chat/domain/saved_messages/saved_messages";
import { CryptoEncryptionService } from "../../../../src/modules/infrasctructure/crypto_encryption_service";
import * as crypto from "crypto";

describe("SavedMessagesRepoPg (integration)", () => {

    let pool: Pool;
    let client: PoolClient;
    let repo: SavedMessagesRepoPg;
    let encryptionService: CryptoEncryptionService;

    const USER_ID = "11111111-1111-1111-1111-111111111111";
    const MESSAGE_ID = "22222222-2222-2222-2222-222222222222";
    const CONVERSATION_ID = "33333333-3333-3333-3333-333333333333";
    const TEST_KEY = crypto.randomBytes(32).toString('hex');

    beforeAll(async () => {
        pool = new Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });
        encryptionService = new CryptoEncryptionService(TEST_KEY);
    });

    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");

        await client.query(`DELETE FROM conversation_reads`);
        await client.query(`DELETE FROM saved_messages`);
        await client.query(`DELETE FROM message_attachments`);
        await client.query(`DELETE FROM messages`);
        await client.query(`DELETE FROM conversation_participants`);
        await client.query(`DELETE FROM conversations`);
        await client.query(`DELETE FROM users`);

        repo = new SavedMessagesRepoPg(client, encryptionService);

        // user
        await client.query(`
            INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
            VALUES ($1,'user','test@test.com','hash',true,true,NOW(),NOW())
        `, [USER_ID]);

        // conversation
        await client.query(`
            INSERT INTO conversations
            (id, conversation_type, title, created_by, created_at, last_message_at, user_low, user_high)
            VALUES ($1,'direct','', $2, NOW(), NULL, $2, '44444444-4444-4444-4444-444444444444')
        `, [CONVERSATION_ID, USER_ID]);

        // message
        await client.query(`
            INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `, [MESSAGE_ID, CONVERSATION_ID, USER_ID, 'encrypted-placeholder']);
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should save and restore message content encrypted", async () => {
        const savedMessage = SavedMessages.create(
            USER_ID,
            MESSAGE_ID,
            CONVERSATION_ID,
            USER_ID,
            "secret content",
            new Date(),
            null
        );

        await repo.saveMessage(savedMessage);

        const result = await client.query(`SELECT * FROM saved_messages WHERE message_id = $1`, [MESSAGE_ID]);
        expect(result.rows[0].content).not.toBe("secret content");
        expect(result.rows[0].content).toContain(":");

        const list = await repo.getSavedMessages(USER_ID);
        expect(list.items.length).toBe(1);
        expect(list.items[0].getContent()).toBe("secret content");
    });
});
