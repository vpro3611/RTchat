"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const validate_params_1 = require("../../../../src/modules/middlewares/validate_params");
const validate_body_1 = require("../../../../src/modules/middlewares/validate_body");
const ban_group_participant_controller_1 = require("../../../../src/modules/chat/controllers/participant/ban_group_participant_controller");
const error_middleware_1 = require("../../../../src/modules/middlewares/error_middleware");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
describe("BanGroupParticipantController (HTTP)", () => {
    let banGroupParticipantService;
    let extractActorId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        banGroupParticipantService = {
            banGroupParticipantService: jest.fn()
        };
        extractActorId = {
            extractActorId: jest.fn()
        };
        const controller = new ban_group_participant_controller_1.BanGroupParticipantController(banGroupParticipantService, extractActorId);
        app.patch("/conversation/:conversationId/:targetId/ban", (0, validate_params_1.validateParams)(ban_group_participant_controller_1.BanGroupParticipantParamsSchema), (0, validate_body_1.validateBody)(ban_group_participant_controller_1.BanGroupParticipantBodySchema), controller.banGroupParticipantCont);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const banDTO = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        userId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        bannedBy: "7da7b810-9dad-11d1-80b4-00c04fd430c9",
        createdAt: new Date().toISOString(),
        reason: "Spam"
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should ban user successfully", async () => {
        const app = buildApp();
        extractActorId.extractActorId.mockReturnValue({ sub: "7da7b810-9dad-11d1-80b4-00c04fd430c9" });
        banGroupParticipantService.banGroupParticipantService.mockResolvedValue(banDTO);
        const res = await (0, supertest_1.default)(app)
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
        const res = await (0, supertest_1.default)(app)
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
        const res = await (0, supertest_1.default)(app)
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
        const res = await (0, supertest_1.default)(app)
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
        const res = await (0, supertest_1.default)(app)
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
        banGroupParticipantService.banGroupParticipantService.mockRejectedValue(new participant_errors_1.ActorIsNotParticipantError("Actor is not a member of the conversation"));
        const res = await (0, supertest_1.default)(app)
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
        banGroupParticipantService.banGroupParticipantService.mockRejectedValue(new participant_errors_1.InsufficientPermissionsError("Actor is not allowed to ban this user"));
        const res = await (0, supertest_1.default)(app)
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
        banGroupParticipantService.banGroupParticipantService.mockRejectedValue(new Error("unexpected error"));
        const res = await (0, supertest_1.default)(app)
            .patch("/conversation/550e8400-e29b-41d4-a716-446655440000/6ba7b810-9dad-11d1-80b4-00c04fd430c8/ban")
            .send({ reason: "Spam" });
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
