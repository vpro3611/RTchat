"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const participant_repository_pg_1 = require("../../../../src/modules/chat/repositories_pg_realization/participant_repository_pg");
const participant_1 = require("../../../../src/modules/chat/domain/participant/participant");
describe("ParticipantRepositoryPg (integration)", () => {
    let pool;
    let client;
    let repo;
    const USER_A = "11111111-1111-1111-1111-111111111111";
    const USER_B = "22222222-2222-2222-2222-222222222222";
    const CONVERSATION_ID = "33333333-3333-3333-3333-333333333333";
    beforeAll(async () => {
        pool = new pg_1.Pool({
            connectionString: process.env.TEST_DATABASE_URL
        });
    });
    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");
        // Clean up before test
        await client.query(`DELETE FROM conversation_participants WHERE conversation_id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM conversations WHERE id = $1`, [CONVERSATION_ID]);
        await client.query(`DELETE FROM users WHERE id IN ($1, $2)`, [USER_A, USER_B]);
        repo = new participant_repository_pg_1.ParticipantRepositoryPg(client);
        // users
        await client.query(`
            INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
            VALUES
                ($1,'userA','a@test.com','hash',true,true,NOW(),NOW()),
                ($2,'userB','b@test.com','hash',true,true,NOW(),NOW())
        `, [USER_A, USER_B]);
        // conversation
        await client.query(`
            INSERT INTO conversations
            (id, conversation_type, title, created_by, created_at, last_message_at, user_low, user_high)
            VALUES ($1,'direct','', $2, NOW(), NULL, $2, $3)
        `, [CONVERSATION_ID, USER_A, USER_B]);
    });
    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });
    afterAll(async () => {
        await pool.end();
    });
    function createParticipant(userId) {
        return participant_1.Participant.createAsMember(CONVERSATION_ID, userId);
    }
    // =========================
    // save
    // =========================
    it("should insert participant", async () => {
        const participant = createParticipant(USER_A);
        await repo.save(participant);
        const result = await client.query(`SELECT * FROM conversation_participants WHERE user_id=$1`, [USER_A]);
        expect(result.rows.length).toBe(1);
    });
    it("should update participant on conflict", async () => {
        const participant = createParticipant(USER_A);
        await repo.save(participant);
        participant.mute(null);
        await repo.save(participant);
        const result = await client.query(`SELECT can_send_messages FROM conversation_participants WHERE user_id=$1`, [USER_A]);
        expect(result.rows[0].can_send_messages).toBe(false);
    });
    // =========================
    // findParticipant
    // =========================
    it("should find participant", async () => {
        const participant = createParticipant(USER_A);
        await repo.save(participant);
        const found = await repo.findParticipant(CONVERSATION_ID, USER_A);
        expect(found).not.toBeNull();
        expect(found?.userId).toBe(USER_A);
    });
    it("should return null if participant not found", async () => {
        const found = await repo.findParticipant(CONVERSATION_ID, USER_A);
        expect(found).toBeNull();
    });
    // =========================
    // exists
    // =========================
    it("should return true if participant exists", async () => {
        const participant = createParticipant(USER_A);
        await repo.save(participant);
        const exists = await repo.exists(CONVERSATION_ID, USER_A);
        expect(exists).toBe(true);
    });
    it("should return false if participant does not exist", async () => {
        const exists = await repo.exists(CONVERSATION_ID, USER_A);
        expect(exists).toBe(false);
    });
    // =========================
    // remove
    // =========================
    it("should remove participant", async () => {
        const participant = createParticipant(USER_A);
        await repo.save(participant);
        await repo.remove(CONVERSATION_ID, USER_A);
        const exists = await repo.exists(CONVERSATION_ID, USER_A);
        expect(exists).toBe(false);
    });
    // =========================
    // getSpecificParticipant
    // =========================
    it("should return joined participant with user data", async () => {
        const participant = createParticipant(USER_A);
        await repo.save(participant);
        const result = await repo.getSpecificParticipant(CONVERSATION_ID, USER_A);
        expect(result).not.toBeNull();
        expect(result?.conversationId).toBe(CONVERSATION_ID);
        expect(result?.userId).toBe(USER_A);
        expect(result?.username).toBe("userA");
        expect(result?.email).toBe("a@test.com");
        expect(result?.isActive).toBe(true);
    });
    it("should return null if participant not found in getSpecificParticipant", async () => {
        const result = await repo.getSpecificParticipant(CONVERSATION_ID, USER_A);
        expect(result).toBeNull();
    });
    // =========================
    // getParticipants
    // =========================
    it("should return participants of conversation", async () => {
        const p1 = createParticipant(USER_A);
        const p2 = createParticipant(USER_B);
        await repo.save(p1);
        await repo.save(p2);
        const result = await repo.getParticipants(CONVERSATION_ID);
        expect(result.items.length).toBe(2);
    });
    it("should respect limit", async () => {
        const p1 = createParticipant(USER_A);
        const p2 = createParticipant(USER_B);
        await repo.save(p1);
        await repo.save(p2);
        const result = await repo.getParticipants(CONVERSATION_ID, 1);
        expect(result.items.length).toBe(1);
    });
    it("should return nextCursor when more participants exist", async () => {
        const p1 = createParticipant(USER_A);
        const p2 = createParticipant(USER_B);
        await repo.save(p1);
        await repo.save(p2);
        const result = await repo.getParticipants(CONVERSATION_ID, 1);
        expect(result.nextCursor).toBeDefined();
    });
});
