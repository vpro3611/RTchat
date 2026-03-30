"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const toggle_status_controller_1 = require("../../../src/modules/users/controllers/toggle_status_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
describe("ToggleStatusController (HTTP)", () => {
    let toggleStatusService;
    let extractUserId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        toggleStatusService = {
            toggleStatusTxService: jest.fn()
        };
        extractUserId = {
            extractUserId: jest.fn()
        };
        const controller = new toggle_status_controller_1.ToggleStatusController(toggleStatusService, extractUserId);
        app.patch("/users/toggle-status", controller.toggleStatusController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "test@mail.com",
        isActive: false,
        isVerified: true,
        avatarId: null,
        lastSeenAt: "",
        createdAt: "",
        updatedAt: ""
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should toggle user status successfully", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        toggleStatusService.toggleStatusTxService.mockResolvedValue(userDTO);
        const res = await (0, supertest_1.default)(app)
            .patch("/users/toggle-status");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(userDTO);
        expect(extractUserId.extractUserId).toHaveBeenCalled();
        expect(toggleStatusService.toggleStatusTxService)
            .toHaveBeenCalledWith("user-id");
    });
    // -------------------------
    // SERVICE ERROR
    // -------------------------
    it("should propagate service error", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        toggleStatusService.toggleStatusTxService.mockRejectedValue(new Error("service error"));
        const res = await (0, supertest_1.default)(app)
            .patch("/users/toggle-status");
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
