"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const validate_params_1 = require("../../../../src/modules/middlewares/validate_params");
const get_banned_users_controller_1 = require("../../../../src/modules/chat/controllers/participant/get_banned_users_controller");
const error_middleware_1 = require("../../../../src/modules/middlewares/error_middleware");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
describe("GetBannedUsersController (HTTP)", () => {
    let getBannedUsersService;
    let extractActorId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        getBannedUsersService = {
            getBannedUsersService: jest.fn()
        };
        extractActorId = {
            extractActorId: jest.fn()
        };
        const controller = new get_banned_users_controller_1.GetBannedUsersController(getBannedUsersService, extractActorId);
        app.get("/conversation/:conversationId/ban_list", (0, validate_params_1.validateParams)(get_banned_users_controller_1.GetBannedUsersParamsSchema), controller.getBannedUserCont);
        app.use((0, error_middleware_1.errorMiddleware)());
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
        const res = await (0, supertest_1.default)(app)
            .get("/conversation/550e8400-e29b-41d4-a716-446655440000/ban_list");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(bannedUsersDTO);
        expect(res.body.length).toBe(2);
        expect(extractActorId.extractActorId).toHaveBeenCalled();
        expect(getBannedUsersService.getBannedUsersService).toHaveBeenCalledWith("7da7b810-9dad-11d1-80b4-00c04fd430c9", "550e8400-e29b-41d4-a716-446655440000");
    });
    // -------------------------
    // VALIDATION ERROR - Invalid conversationId
    // -------------------------
    it("should return 400 for invalid conversationId format", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
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
        const res = await (0, supertest_1.default)(app)
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
        getBannedUsersService.getBannedUsersService.mockRejectedValue(new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation"));
        const res = await (0, supertest_1.default)(app)
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
        getBannedUsersService.getBannedUsersService.mockRejectedValue(new participant_errors_1.InsufficientPermissionsError("Actor is not an owner of the conversation"));
        const res = await (0, supertest_1.default)(app)
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
        getBannedUsersService.getBannedUsersService.mockRejectedValue(new Error("unexpected error"));
        const res = await (0, supertest_1.default)(app)
            .get("/conversation/550e8400-e29b-41d4-a716-446655440000/ban_list");
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
