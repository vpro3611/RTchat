import { Pool, PoolClient } from "pg";
import { MessageRepositoryPg } from "../../../../src/modules/chat/repositories_pg_realization/message_repository_pg";
import { Message } from "../../../../src/modules/chat/domain/message/message";
import { Content } from "../../../../src/modules/chat/domain/message/content";
import { CryptoEncryptionService } from "../../../../src/modules/infrasctructure/crypto_encryption_service";
import * as crypto from "crypto";

describe("MessageRepositoryPg (integration)", () => {

    let pool: Pool;
    let client: PoolClient;
    let repo: MessageRepositoryPg;
    let encryptionService: CryptoEncryptionService;

    const USER_ID = "11111111-1111-1111-1111-111111111111";
    const CONVERSATION_ID = "22222222-2222-2222-2222-222222222222";
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
        await client.query(`DELETE FROM messages WHERE conversation_id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM conversation_participants WHERE conversation_id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM conversations WHERE id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM users WHERE id = $1`, [USER_ID]);

        repo = new MessageRepositoryPg(client, encryptionService);

        // user
        await client.query(`
            INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
            VALUES ($1,'user','test@test.com','hash',true,true,NOW(),NOW())
        `, [USER_ID]);

        // conversation
        await client.query(`
            INSERT INTO conversations
            (id, conversation_type, title, created_by, created_at, last_message_at, user_low, user_high)
            VALUES ($1,'direct','', $2, NOW(), NULL, $2, '33333333-3333-3333-3333-333333333333')
        `, [CONVERSATION_ID, USER_ID]);

    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    function createMessage(text: string) {
        return Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create(text)
        );
    }

    // =========================
    // create
    // =========================

    it("should create message and store it encrypted", async () => {

        const message = createMessage("hello");

        await repo.create(message);

        const result = await client.query(
            `SELECT * FROM messages WHERE id = $1`,
            [message.id]
        );

        expect(result.rows.length).toBe(1);
        expect(result.rows[0].content).not.toBe("hello");
        expect(result.rows[0].content).toContain(":");
        
        const decrypted = encryptionService.decrypt(result.rows[0].content);
        expect(decrypted).toBe("hello");
    });

    // =========================
    // findById
    // =========================

    it("should find message by id and decrypt it", async () => {

        const message = createMessage("hello");

        await repo.create(message);

        const found = await repo.findById(message.id);

        expect(found).not.toBeNull();
        expect(found?.getContent().getContentValue()).toBe("hello");
    });

    it("should return null if message not found", async () => {

        const found = await repo.findById("00000000-0000-0000-0000-000000000000");

        expect(found).toBeNull();
    });

    // =========================
    // update
    // =========================

    it("should update message and store it encrypted", async () => {

        const message = createMessage("hello");

        await repo.create(message);

        message.editMessage("updated");

        await repo.update(message);

        const result = await client.query(
            `SELECT * FROM messages WHERE id=$1`,
            [message.id]
        );

        expect(result.rows[0].content).not.toBe("updated");
        expect(encryptionService.decrypt(result.rows[0].content)).toBe("updated");
        expect(result.rows[0].is_edited).toBe(true);
    });

    // =========================
    // findByConversationId
    // =========================

    it("should return messages for conversation", async () => {

        const m1 = createMessage("one");
        const m2 = createMessage("two");

        await repo.create(m1);
        await repo.create(m2);

        const result = await repo.findByConversationId(CONVERSATION_ID);

        expect(result.items.length).toBe(2);
    });

    it("should respect limit", async () => {

        const m1 = createMessage("one");
        const m2 = createMessage("two");
        const m3 = createMessage("three");

        await repo.create(m1);
        await repo.create(m2);
        await repo.create(m3);

        const result = await repo.findByConversationId(CONVERSATION_ID, 2);

        expect(result.items.length).toBe(2);
    });

    // =========================
    // cursor pagination
    // =========================

    it("should return nextCursor when more messages exist", async () => {

        const m1 = createMessage("one");
        const m2 = createMessage("two");
        const m3 = createMessage("three");

        await repo.create(m1);
        await repo.create(m2);
        await repo.create(m3);

        const result = await repo.findByConversationId(CONVERSATION_ID, 2);

        expect(result.nextCursor).toBeDefined();
    });

    it("should save and restore resent message with original_sender_id and is_resent", async () => {

        const originalSenderId = USER_ID;
        const actorId = USER_ID;
        const content = Content.create("resent message");

        const resentMessage = Message.createResent(
            CONVERSATION_ID,
            actorId,
            content,
            originalSenderId
        );

        await repo.create(resentMessage);

        const found = await repo.findById(resentMessage.id);

        expect(found).not.toBeNull();
        expect(found?.getIsResent()).toBe(true);
        expect(found?.getOriginalSenderId()).toBe(originalSenderId);
    });

    it("should create and retrieve a message reply with metadata", async () => {
        const parentMessage = createMessage("parent message");
        await repo.create(parentMessage);

        const replyMetadata = {
            parentMessageId: parentMessage.id,
            parentContentSnippet: "parent message",
            parentSenderId: USER_ID
        };

        const replyMessage = Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create("reply message"),
            [],
            replyMetadata
        );

        await repo.create(replyMessage);

        const found = await repo.findById(replyMessage.id);

        expect(found).not.toBeNull();
        expect(found?.getReplyMetadata()).toEqual(replyMetadata);

        const conversationMessages = await repo.findByConversationId(CONVERSATION_ID);
        const foundInList = conversationMessages.items.find(m => m.id === replyMessage.id);
        expect(foundInList?.getReplyMetadata()).toEqual(replyMetadata);
    });

});