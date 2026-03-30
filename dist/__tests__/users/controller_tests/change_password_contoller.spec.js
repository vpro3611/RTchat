"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const change_password_controller_1 = require("../../../src/modules/users/controllers/change_password_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
describe("ChangePasswordController (HTTP)", () => {
    let changePasswordService;
    let extractUserId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        changePasswordService = {
            changePasswordTxService: jest.fn()
        };
        extractUserId = {
            extractUserId: jest.fn()
        };
        const controller = new change_password_controller_1.ChangePasswordController(changePasswordService, extractUserId);
        app.patch("/users/password", 
        // Zod validation
        (req, res, next) => {
            const parsed = change_password_controller_1.ChangePasswordBodySchema.safeParse(req.body);
            if (!parsed.success) {
                return next(parsed.error);
            }
            req.body = parsed.data;
            next();
        }, controller.changePasswordController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const responseDTO = {
        id: "user-id",
        username: "testuser",
        email: "test@mail.com",
        isActive: true,
        isVerified: true,
        avatarId: null,
        lastSeenAt: "",
        createdAt: "",
        updatedAt: ""
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should change password successfully", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        changePasswordService.changePasswordTxService.mockResolvedValue(responseDTO);
        const res = await (0, supertest_1.default)(app)
            .patch("/users/password")
            .send({
            oldPassword: "OldPass123!",
            newPassword: "NewPass123!"
        });
        expect(res.status).toBe(200);
        expect(res.body).toEqual(responseDTO);
        expect(extractUserId.extractUserId).toHaveBeenCalled();
        expect(changePasswordService.changePasswordTxService)
            .toHaveBeenCalledWith("user-id", "OldPass123!", "NewPass123!");
    });
    // -------------------------
    // VALIDATION ERROR
    // -------------------------
    it("should return 400 if body invalid", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .patch("/users/password")
            .send({
            oldPassword: "123"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // -------------------------
    // SERVICE ERROR
    // -------------------------
    it("should propagate service error", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        changePasswordService.changePasswordTxService.mockRejectedValue(new Error("service error"));
        const res = await (0, supertest_1.default)(app)
            .patch("/users/password")
            .send({
            oldPassword: "OldPass123!",
            newPassword: "NewPass123!"
        });
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
