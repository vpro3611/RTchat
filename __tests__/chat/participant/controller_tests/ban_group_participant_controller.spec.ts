import express from "express";
import request from "supertest";

import { validateParams } from "../../../../src/modules/middlewares/validate_params";
import { validateBody } from "../../../../src/modules/middlewares/validate_body";
import { BanGroupParticipantController, BanGroupParticipantParamsSchema, BanGroupParticipantBodySchema } from "../../../../src/modules/chat/controllers/participant/ban_group_participant_controller";
import { BanGroupParticipantService } from "../../../../src/modules/chat/transactional_services/participant/ban_group_participant_service";
import { ExtractActorId } from "../../../../src/modules/chat/shared/extract_actor_id_req";
import { errorMiddleware } from "../../../../src/modules/middlewares/error_middleware";
import { ActorIsNotParticipantError, InsufficientPermissionsError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";

describe("BanGroupParticipantController (HTTP)", () => {

    let banGroupParticipantService: jest.Mocked<BanGroupParticipantService>;
    let extractActorId: jest.Mocked<ExtractActorId>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        banGroupParticipantService = {
            banGroupParticipantService: jest.fn()
        } as any;

        extractActorId = {
            extractActorId: jest.fn()
        } as any;

        const controller = new BanGroupParticipantController(
            banGroupParticipantService,
            extractActorId
        );

        app.patch(
            "/conversation/:conversationId/:targetId/ban",
            validateParams(BanGroupParticipantParamsSchema),
            validateBody(BanGroupParticipantBodySchema),
            controller.banGroupParticipantCont
        );

        app.use(errorMiddleware());

        return app;
    };

    const banDTO = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        userId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        bannedBy: "7da7b810-9dad-11d1-80b4-00c04fd430c9",
        createdAt: new Date(),
        reason: "Spam"
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should ban user successfully", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        banGroupParticipantService.banGroupParticipantService.mockResolvedValue(banDTO);

        const res = await request(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({ reason: "Spam" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.objectContaining({
            conversationId: "550e8400-e29b-41d4-a716-446655440000",
            userId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            bannedBy: "7da7b810-9dad-11d1-80b4-00c04fd430c9",
            reason: "Spam"
        }));
        expect(extractActorId.extractActorId).toHaveBeenCalled();
    });

    // -------------------------
    // VALIDATION ERROR - Invalid conversationId
    // -------------------------

    it("should return 400 for invalid conversationId format", async () => {
        const app = buildApp();

        const res = await request(app)
            .patch("/conversation/invalid-uuid/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({ reason: "Spam" });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // VALIDATION ERROR - Invalid targetId
    // -------------------------

    it("should return 400 for invalid targetId format", async () => {
        const app = buildApp();

        const res = await request(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/invalid-uuid/ban")
            .send({ reason: "Spam" });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // VALIDATION ERROR - Missing reason
    // -------------------------

    it("should return 400 for missing reason in body", async () => {
        const app = buildApp();

        const res = await request(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // VALIDATION ERROR - Empty reason
    // -------------------------

    it("should return 400 for empty reason", async () => {
        const app = buildApp();

        const res = await request(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({ reason: "" });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Actor not participant
    // -------------------------

    it("should return 403 if actor is not a participant", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        banGroupParticipantService.banGroupParticipantService.mockRejectedValue(
            new ActorIsNotParticipantError("Actor is not a member of the conversation")
        );

        const res = await request(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({ reason: "Spam" });

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Insufficient permissions
    // -------------------------

    it("should return 403 if actor has insufficient permissions", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        banGroupParticipantService.banGroupParticipantService.mockRejectedValue(
            new InsufficientPermissionsError("Actor is not allowed to ban this user")
        );

        const res = await request(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({ reason: "Spam" });

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Unexpected
    // -------------------------

    it("should return 500 on unexpected error", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        banGroupParticipantService.banGroupParticipantService.mockRejectedValue(
            new Error("unexpected error")
        );

        const res = await request(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({ reason: "Spam" });

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});
