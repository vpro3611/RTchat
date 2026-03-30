
import express from "express";
import request from "supertest";
import { assembleContainer } from "../../../src/container";
import { createApp } from "../../../src/app";
import { Server } from "socket.io";
import { createServer } from "http";
import { pool } from "../../../src/database";

jest.mock("../../../src/modules/infrasctructure/ports/cache_service/reddis_client", () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        multi: jest.fn(),
        scanIterator: jest.fn(() => (async function* () {
            yield [];
        })()),
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined),
        quit: jest.fn().mockResolvedValue(undefined),
    },
}));

describe("ResendMessage (E2E)", () => {
    let app: express.Express;
    let container: any;

    const USER_A_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const CONV_1_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
    const CONV_2_ID = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
    const MSG_1_ID = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";

    beforeAll(async () => {
        const httpServer = createServer();
        const io = new Server(httpServer);
        container = assembleContainer(io);
        
        // Mock auth to return User A
        container.jwtTokenService.verifyAccessToken = jest.fn().mockReturnValue({
            sub: USER_A_ID,
            username: "userA"
        });

        app = createApp(container);
    });

    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        // Cleanup
        await pool.query("DELETE FROM messages WHERE conversation_id IN ($1, $2)", [CONV_1_ID, CONV_2_ID]);
        await pool.query("DELETE FROM conversation_participants WHERE conversation_id IN ($1, $2)", [CONV_1_ID, CONV_2_ID]);
        await pool.query("DELETE FROM conversations WHERE id IN ($1, $2)", [CONV_1_ID, CONV_2_ID]);
        await pool.query("DELETE FROM users WHERE id = $1 OR username = 'userA' OR email = 'userA@test.com'", [USER_A_ID]);

        // Setup User A
        await pool.query(`
            INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
            VALUES ($1, 'userA', 'userA@test.com', 'hash', true, true, NOW(), NOW())
        `, [USER_A_ID]);

        // Setup Conversations (Groups to avoid direct chat logic complexity)
        await pool.query(`
            INSERT INTO conversations (id, conversation_type, title, created_by, created_at)
            VALUES ($1, 'group', 'Conv 1', $2, NOW()), ($3, 'group', 'Conv 2', $2, NOW())
        `, [CONV_1_ID, USER_A_ID, CONV_2_ID]);

        // Setup Participants
        await pool.query(`
            INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
            VALUES ($1, $2, 'admin', NOW()), ($3, $2, 'admin', NOW())
        `, [CONV_1_ID, USER_A_ID, CONV_2_ID]);

        // Setup Message 1 in Conv 1
        await pool.query(`
            INSERT INTO messages (id, conversation_id, sender_id, content, is_resent, is_edited, created_at, updated_at)
            VALUES ($1, $2, $3, 'Hello from Conv 1', false, false, NOW(), NOW())
        `, [MSG_1_ID, CONV_1_ID, USER_A_ID]);
    });

    it("should return 401 if unauthorized (no token)", async () => {
        const res = await request(app)
            .post(`/private/conversation/${CONV_1_ID}/messages/${MSG_1_ID}/resend`)
            .send({ targetConversationId: CONV_2_ID });

        expect(res.status).toBe(401);
    });

    it("should return 400 for invalid UUIDs when authorized", async () => {
        const res = await request(app)
            .post("/private/conversation/invalid-uuid/messages/another-invalid/resend")
            .set("Authorization", "Bearer valid-token")
            .send({ targetConversationId: "not-a-uuid" });

        expect(res.status).toBe(400); 
    });

    it("should successfully resend a message and preserve original sender", async () => {
        // 1. User A resends message from Conv 1 to Conv 2
        const res = await request(app)
            .post(`/private/conversation/${CONV_1_ID}/messages/${MSG_1_ID}/resend`)
            .set("Authorization", "Bearer valid-token")
            .send({ targetConversationId: CONV_2_ID });

        if (res.status !== 201) {
            console.log("Error body:", JSON.stringify(res.body, null, 2));
        }
        expect(res.status).toBe(201);
        expect(res.body.isResent).toBe(true);
        expect(res.body.originalSenderId).toBe(USER_A_ID);
        expect(res.body.content).toBe('Hello from Conv 1');
        expect(res.body.conversationId).toBe(CONV_2_ID);

        const newMsgId = res.body.id;

        // 2. Verify in DB
        const dbRes = await pool.query("SELECT * FROM messages WHERE id = $1", [newMsgId]);
        expect(dbRes.rows[0].is_resent).toBe(true);
        expect(dbRes.rows[0].original_sender_id).toBe(USER_A_ID);

        // 3. User A resends the ALREADY RESENT message back to Conv 1 (or anywhere)
        const res2 = await request(app)
            .post(`/private/conversation/${CONV_2_ID}/messages/${newMsgId}/resend`)
            .set("Authorization", "Bearer valid-token")
            .send({ targetConversationId: CONV_1_ID });

        expect(res2.status).toBe(201);
        expect(res2.body.isResent).toBe(true);
        expect(res2.body.originalSenderId).toBe(USER_A_ID); // Should still be User A
        expect(res2.body.content).toBe('Hello from Conv 1');
    });
});
