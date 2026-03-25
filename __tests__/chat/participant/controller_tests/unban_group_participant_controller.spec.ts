import express from "express";
import request from "supertest";

import { validateParams } from "../../../../src/modules/middlewares/validate_params";
import { UnbanGroupParticipantController, UnbanGroupParticipantParamsSchema } from "../../../../src/modules/chat/controllers/participant/unban_group_participant_controller";
import { UnbanGroupParticipantService } from "../../../../src/modules/chat/transactional_services/participant/unban_group_participant_service";
import { ExtractActorId } from "../../../../src/modules/chat/shared/extract_actor_id_req";
import { errorMiddleware } from "../../../../src/modules/middlewares/error_middleware";
import { ActorIsNotParticipantError, InsufficientPermissionsError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { NotBannedError } from "../../../../src/modules/chat/errors/conversation_bans_error/conversation_bans_errors";

describe("UnbanGroupParticipantController (HTTP)", () => {

    let unbanGroupParticipantService: jest.Mocked<UnbanGroupParticipantService>;
    let extractActorId: jest.Mocked<ExtractActorId>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        unbanGroupParticipantService = {
            unbanGroupParticipantService: jest.fn()
        } as any;

        extractActorId = {
            extractActorId: jest.fn()
        } as any;

        const controller = new UnbanGroupParticipantController(
            unbanGroupParticipantService,
            extractActorId
        );

        app.delete(
            "/conversation/:conversationId/:targetId/unban",
            validateParams(UnbanGroupParticipantParamsSchema),
            controller.unbanGroupParticipantCont
        );

        app.use(errorMiddleware());

        return app;
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should unban user successfully", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        unbanGroupParticipantService.unbanGroupParticipantService.mockResolvedValue(undefined);

        const res = await request(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");

        expect(res.status).toBe(204);
        expect(extractActorId.extractActorId).toHaveBeenCalled();
        expect(unbanGroupParticipantService.unbanGroupParticipantService).toHaveBeenCalledWith(
            "7da7b810-9dad-11d1-80b4-00c04fd430c9",
            "550e8400-e29b-41d4-a716-446655440000",
            "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
        );
    });

    // -------------------------
    // VALIDATION ERROR - Invalid conversationId
    // -------------------------

    it("should return 400 for invalid conversationId format", async () => {
        const app = buildApp();

        const res = await request(app)
            .delete("/conversation/invalid-uuid/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // VALIDATION ERROR - Invalid targetId
    // -------------------------

    it("should return 400 for invalid targetId format", async () => {
        const app = buildApp();

        const res = await request(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/invalid-uuid/unban");

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Actor not participant
    // -------------------------

    it("should return 403 if actor is not a participant", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(
            new ActorIsNotParticipantError("Actor is not a member of the conversation")
        );

        const res = await request(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - User not banned
    // -------------------------

    it("should return 409 if user is not banned", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(
            new NotBannedError("User is not banned from the conversation")
        );

        const res = await request(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");

        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Insufficient permissions
    // -------------------------

    it("should return 403 if actor has insufficient permissions", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(
            new InsufficientPermissionsError("Actor is not allowed to unban this user")
        );

        const res = await request(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Unexpected
    // -------------------------

    it("should return 500 on unexpected error", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(
            new Error("unexpected error")
        );

        const res = await request(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});
