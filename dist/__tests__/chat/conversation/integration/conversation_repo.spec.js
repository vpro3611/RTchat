"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const conversation_repository_pg_1 = require("../../../../src/modules/chat/repositories_pg_realization/conversation_repository_pg");
const conversation_1 = require("../../../../src/modules/chat/domain/conversation/conversation");
const conversation_type_1 = require("../../../../src/modules/chat/domain/conversation/conversation_type");
describe("ConversationRepositoryPg (integration)", () => {
    let pool;
    let client;
    let repo;
    const USER_A = "11111111-1111-1111-1111-111111111111";
    const USER_B = "22222222-2222-2222-2222-222222222222";
    beforeAll(async () => {
        pool = new pg_1.Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });
    });
    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");
        // Clean up before test
        await client.query(`DELETE FROM conversation_participants WHERE user_id IN ($1, $2)`, [USER_A, USER_B]);
        await client.query(`DELETE FROM conversations WHERE user_low IN ($1, $2) OR user_high IN ($1, $2) OR created_by IN ($1, $2)`, [USER_A, USER_B]);
        await client.query(`DELETE FROM users WHERE id IN ($1, $2)`, [USER_A, USER_B]);
        repo = new conversation_repository_pg_1.ConversationRepositoryPg(client);
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
        return conversation_1.Conversation.restore(crypto.randomUUID(), conversation_type_1.ConversationType.DIRECT, "", // <-- важно
        USER_A, new Date(), null, USER_A, USER_B);
    }
    function createGroupConversation() {
        return conversation_1.Conversation.restore(crypto.randomUUID(), conversation_type_1.ConversationType.GROUP, "Test group", USER_A, new Date(), null, null, null);
    }
    // ---------- tests ----------
    it("should create direct conversation", async () => {
        const conversation = createDirectConversation();
        await repo.create(conversation);
        const result = await client.query("SELECT * FROM conversations WHERE id = $1", [conversation.id]);
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].conversation_type).toBe("direct");
    });
    it("should create group conversation", async () => {
        const conversation = createGroupConversation();
        await repo.create(conversation);
        const result = await client.query("SELECT * FROM conversations WHERE id = $1", [conversation.id]);
        expect(result.rows[0].title).toBe("Test group");
    });
    it("should update conversation title", async () => {
        const conversation = createGroupConversation();
        await repo.create(conversation);
        conversation.updateTitle("New Title");
        await repo.update(conversation);
        const result = await client.query("SELECT title FROM conversations WHERE id=$1", [conversation.id]);
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
        const result = await client.query("SELECT last_message_at FROM conversations WHERE id=$1", [conversation.id]);
        expect(new Date(result.rows[0].last_message_at).getTime())
            .toBeCloseTo(now.getTime(), -2);
    });
});
