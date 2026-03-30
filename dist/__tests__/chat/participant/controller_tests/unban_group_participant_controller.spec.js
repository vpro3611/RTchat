"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const validate_params_1 = require("../../../../src/modules/middlewares/validate_params");
const unban_group_participant_controller_1 = require("../../../../src/modules/chat/controllers/participant/unban_group_participant_controller");
const error_middleware_1 = require("../../../../src/modules/middlewares/error_middleware");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const conversation_bans_errors_1 = require("../../../../src/modules/chat/errors/conversation_bans_error/conversation_bans_errors");
describe("UnbanGroupParticipantController (HTTP)", () => {
    let unbanGroupParticipantService;
    let extractActorId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        unbanGroupParticipantService = {
            unbanGroupParticipantService: jest.fn()
        };
        extractActorId = {
            extractActorId: jest.fn()
        };
        const controller = new unban_group_participant_controller_1.UnbanGroupParticipantController(unbanGroupParticipantService, extractActorId);
        app.delete("/conversation/:conversationId/:targetId/unban", (0, validate_params_1.validateParams)(unban_group_participant_controller_1.UnbanGroupParticipantParamsSchema), controller.unbanGroupParticipantCont);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should unban user successfully", async () => {
        const app = buildApp();
        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        unbanGroupParticipantService.unbanGroupParticipantService.mockResolvedValue(undefined);
        const res = await (0, supertest_1.default)(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");
        expect(res.status).toBe(204);
        expect(extractActorId.extractActorId).toHaveBeenCalled();
        expect(unbanGroupParticipantService.unbanGroupParticipantService).toHaveBeenCalledWith("7da7b810-9dad-11d1-80b4-00c04fd430c9", "550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-11d1-80b4-00c04fd430c8");
    });
    // -------------------------
    // VALIDATION ERROR - Invalid conversationId
    // -------------------------
    it("should return 400 for invalid conversationId format", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .delete("/conversation/invalid-uuid/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // -------------------------
    // VALIDATION ERROR - Invalid targetId
    // -------------------------
    it("should return 400 for invalid targetId format", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
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
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation"));
        const res = await (0, supertest_1.default)(app)
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
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(new conversation_bans_errors_1.NotBannedError("User is not banned from the conversation"));
        const res = await (0, supertest_1.default)(app)
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
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(new participant_errors_1.InsufficientPermissionsError("Actor is not allowed to unban this user"));
        const res = await (0, supertest_1.default)(app)
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
        unbanGroupParticipantService.unbanGroupParticipantService.mockRejectedValue(new Error("unexpected error"));
        const res = await (0, supertest_1.default)(app)
            .delete("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/unban");
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
