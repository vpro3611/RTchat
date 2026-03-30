import express from "express";
import request from "supertest";

import { validateParams } from "../../../../src/modules/middlewares/validate_params";
import { GetBannedUsersController, GetBannedUsersParamsSchema } from "../../../../src/modules/chat/controllers/participant/get_banned_users_controller";
import { GetBannedUsersService } from "../../../../src/modules/chat/transactional_services/participant/get_banned_users_service";
import { ExtractActorId } from "../../../../src/modules/chat/shared/extract_actor_id_req";
import { errorMiddleware } from "../../../../src/modules/middlewares/error_middleware";
import { ActorIsNotParticipantError, InsufficientPermissionsError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";

describe("GetBannedUsersController (HTTP)", () => {

    let getBannedUsersService: jest.Mocked<GetBannedUsersService>;
    let extractActorId: jest.Mocked<ExtractActorId>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        getBannedUsersService = {
            getBannedUsersService: jest.fn()
        } as any;

        extractActorId = {
            extractActorId: jest.fn()
        } as any;

        const controller = new GetBannedUsersController(
            getBannedUsersService,
            extractActorId
        );

        app.get(
            "/conversation/:conversationId/ban_list",
            validateParams(GetBannedUsersParamsSchema),
            controller.getBannedUserCont
        );

        app.use(errorMiddleware());

        return app;
    };

    const bannedUsersDTO = [
        {
            conversationId: "550e8400-e29b-41d4-a716-446655440000",
            userId: "banned-user-1",
            bannedBy: "7da7b810-9dad-11d1-80b4-00c04fd430c9",
            createdAt: "2024-01-15T10:30:00.000Z",
            reason: "Spam"
        },
        {
            conversationId: "550e8400-e29b-41d4-a716-446655440000",
            userId: "banned-user-2",
            bannedBy: "7da7b810-9dad-11d1-80b4-00c04fd430c9",
            createdAt: "2024-01-16T11:00:00.000Z",
            reason: "Harassment"
        }
    ];

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should return banned users successfully", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        getBannedUsersService.getBannedUsersService.mockResolvedValue(bannedUsersDTO);

        const res = await request(app)
            .get("/conversation/550e8400-e29b-41d4-a716-446655440000/ban_list");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(bannedUsersDTO);
        expect(res.body.length).toBe(2);
        expect(extractActorId.extractActorId).toHaveBeenCalled();
        expect(getBannedUsersService.getBannedUsersService).toHaveBeenCalledWith(
            "7da7b810-9dad-11d1-80b4-00c04fd430c9",
            "550e8400-e29b-41d4-a716-446655440000"
        );
    });

    // -------------------------
    // VALIDATION ERROR - Invalid conversationId
    // -------------------------

    it("should return 400 for invalid conversationId format", async () => {
        const app = buildApp();

        const res = await request(app)
            .get("/conversation/invalid-uuid/ban_list");

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // Empty banned list
    // -------------------------

    it("should return empty array when no users are banned", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        getBannedUsersService.getBannedUsersService.mockResolvedValue([]);

        const res = await request(app)
            .get("/conversation/550e8400-e29b-41d4-a716-446655440000/ban_list");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    // -------------------------
    // SERVICE ERROR - Actor not participant
    // -------------------------

    it("should return 403 if actor is not a participant", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        getBannedUsersService.getBannedUsersService.mockRejectedValue(
            new ActorIsNotParticipantError("Actor is not a member of the conversation")
        );

        const res = await request(app)
            .get("/conversation/550e8400-e29b-41d4-a716-446655440000/ban_list");

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Actor not owner
    // -------------------------

    it("should return 403 if actor is not owner of the conversation", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        getBannedUsersService.getBannedUsersService.mockRejectedValue(
            new InsufficientPermissionsError("Actor is not an owner of the conversation")
        );

        const res = await request(app)
            .get("/conversation/550e8400-e29b-41d4-a716-446655440000/ban_list");

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - Unexpected
    // -------------------------

    it("should return 500 on unexpected error", async () => {
        const app = buildApp();

        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        getBannedUsersService.getBannedUsersService.mockRejectedValue(
            new Error("unexpected error")
        );

        const res = await request(app)
            .get("/conversation/550e8400-e29b-41d4-a716-446655440000/ban_list");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});
