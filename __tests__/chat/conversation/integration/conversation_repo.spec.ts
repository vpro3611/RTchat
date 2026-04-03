import { Pool, PoolClient } from "pg";
import { ConversationRepositoryPg } from "../../../../src/modules/chat/repositories_pg_realization/conversation_repository_pg";
import { Conversation } from "../../../../src/modules/chat/domain/conversation/conversation";
import { ConversationType } from "../../../../src/modules/chat/domain/conversation/conversation_type";
import { CryptoEncryptionService } from "../../../../src/modules/infrasctructure/crypto_encryption_service";
import * as crypto from "crypto";

describe("ConversationRepositoryPg (integration)", () => {

    let pool: Pool;
    let client: PoolClient;
    let repo: ConversationRepositoryPg;
    let encryptionService: CryptoEncryptionService;

    const USER_A = "11111111-1111-1111-1111-111111111111";
    const USER_B = "22222222-2222-2222-2222-222222222222";
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

        // Clean up before test
        await client.query(`DELETE FROM conversation_reads`);
        await client.query(`DELETE FROM messages`); // Clean messages as well for last_message tests
        await client.query(`DELETE FROM conversation_participants`);
        await client.query(`DELETE FROM conversations`);
        await client.query(`DELETE FROM users`);

        repo = new ConversationRepositoryPg(client, encryptionService);

        // создаём пользователей для FK
        await client.query(`
            INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
            VALUES
            ($1,'userA','a@test.com','hash',true,true,NOW(),NOW()),
            ($2,'userB','b@test.com','hash',true,true,NOW(),NOW())
        `, [USER_A, USER_B]);
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    // ---------- factories ----------

    function createDirectConversation() {
        return Conversation.restore(
            crypto.randomUUID(),
            ConversationType.DIRECT,
            "",                 // <-- важно
            USER_A,
            new Date(),
            null,
            USER_A,
            USER_B
        );
    }

    function createGroupConversation() {
        return Conversation.restore(
            crypto.randomUUID(),
            ConversationType.GROUP,
            "Test group",
            USER_A,
            new Date(),
            null,
            null,
            null
        );
    }

    // ---------- tests ----------

    it("should create direct conversation", async () => {

        const conversation = createDirectConversation();

        await repo.create(conversation);

        const result = await client.query(
            "SELECT * FROM conversations WHERE id = $1",
            [conversation.id]
        );

        expect(result.rows.length).toBe(1);
        expect(result.rows[0].conversation_type).toBe("direct");
    });

    it("should create group conversation", async () => {

        const conversation = createGroupConversation();

        await repo.create(conversation);

        const result = await client.query(
            "SELECT * FROM conversations WHERE id = $1",
            [conversation.id]
        );

        expect(result.rows[0].title).toBe("Test group");
    });

    it("should update conversation title", async () => {

        const conversation = createGroupConversation();

        await repo.create(conversation);

        conversation.updateTitle("New Title");

        await repo.update(conversation);

        const result = await client.query(
            "SELECT title FROM conversations WHERE id=$1",
            [conversation.id]
        );

        expect(result.rows[0].title).toBe("New Title");
    });

    it("should find conversation by id", async () => {

        const conversation = createDirectConversation();

        await repo.create(conversation);

        const found = await repo.findById(conversation.id);

        expect(found).not.toBeNull();
        expect(found?.id).toBe(conversation.id);
    });

    it("should find direct conversation", async () => {

        const conversation = createDirectConversation();

        await repo.create(conversation);

        const found = await repo.findDirectConversation(USER_A, USER_B);

        expect(found).not.toBeNull();
        expect(found?.id).toBe(conversation.id);
    });

    it("should find conversation regardless of user order", async () => {

        const conversation = createDirectConversation();

        await repo.create(conversation);

        const found = await repo.findDirectConversation(USER_B, USER_A);

        expect(found?.id).toBe(conversation.id);
    });

    it("should update last message date", async () => {

        const conversation = createDirectConversation();

        await repo.create(conversation);

        const now = new Date();

        await repo.updateLastMessage(conversation.id, now);

        const result = await client.query(
            "SELECT last_message_at FROM conversations WHERE id=$1",
            [conversation.id]
        );

        expect(new Date(result.rows[0].last_message_at).getTime())
            .toBeCloseTo(now.getTime(), -2);
    });

    it("should decrypt last_message_content when finding conversation", async () => {

        const conversation = createDirectConversation();
        await repo.create(conversation);

        const encryptedContent = encryptionService.encrypt("secret message");

        // Manually insert an encrypted message
        await client.query(`
            INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `, [crypto.randomUUID(), conversation.id, USER_A, encryptedContent]);

        const found = await repo.findById(conversation.id);

        expect(found?.getLastMessageContent()).toBe("secret message");
    });

});