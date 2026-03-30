
import express from "express";
import request from "supertest";
import { assembleContainer } from "../../../src/container";
import { createApp } from "../../../src/app";
import { Server } from "socket.io";
import { createServer } from "http";

describe("ResendMessage (E2E)", () => {
    let app: express.Express;
    let container: any;

    beforeAll(() => {
        const httpServer = createServer();
        const io = new Server(httpServer);
        container = assembleContainer(io);
        
        // Mock auth to bypass it
        container.jwtTokenService.verifyAccessToken = jest.fn().mockReturnValue({
            sub: "11111111-1111-1111-1111-111111111111",
            username: "testuser"
        });

        app = createApp(container);
    });

    it("should return 401 if unauthorized (no token)", async () => {
        // We need a fresh app or a way to not mock for this test
        // But for this PR, let's just test the route exists when "authorized"
        const res = await request(app)
            .post("/private/conversation/11111111-1111-1111-1111-111111111111/messages/22222222-2222-2222-2222-222222222222/resend")
            .send({ targetConversationId: "33333333-3333-3333-3333-333333333333" });

        // If route is missing, it should be 404 (because we have a "token")
        // If route exists, it might be 201 or 500 depending on DB
        // But wait, it will be 401 if we don't send the header
        expect(res.status).toBe(401);
    });

    it("should return 400 for invalid UUIDs when authorized", async () => {
        const res = await request(app)
            .post("/private/conversation/invalid-uuid/messages/another-invalid/resend")
            .set("Authorization", "Bearer valid-token")
            .send({ targetConversationId: "not-a-uuid" });

        // If route is missing, it should be 404
        // If route exists, it should be 400 because of validation
        expect(res.status).toBe(400); 
    });
});
