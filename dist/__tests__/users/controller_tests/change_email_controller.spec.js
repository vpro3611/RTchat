"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const change_email_controller_1 = require("../../../src/modules/users/controllers/change_email_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
describe("ChangeEmailController (HTTP)", () => {
    let changeEmailService;
    let extractUserId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        changeEmailService = {
            changeEmailTxService: jest.fn()
        };
        extractUserId = {
            extractUserId: jest.fn()
        };
        const controller = new change_email_controller_1.ChangeEmailController(changeEmailService, extractUserId);
        app.patch("/users/email", 
        // zod validation middleware
        (req, res, next) => {
            const parsed = change_email_controller_1.ChangeEmailBodySchema.safeParse(req.body);
            if (!parsed.success) {
                return next(parsed.error);
            }
            req.body = parsed.data;
            next();
        }, controller.changeEmailController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "new@mail.com",
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
    it("should change email successfully", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        changeEmailService.changeEmailTxService.mockResolvedValue(userDTO);
        const res = await (0, supertest_1.default)(app)
            .patch("/users/email")
            .send({ newEmail: "new@mail.com" });
        expect(res.status).toBe(200);
        expect(res.body).toEqual(userDTO);
        expect(extractUserId.extractUserId).toHaveBeenCalled();
        expect(changeEmailService.changeEmailTxService)
            .toHaveBeenCalledWith("user-id", "new@mail.com");
    });
    // -------------------------
    // VALIDATION ERROR
    // -------------------------
    it("should return 400 if email invalid", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .patch("/users/email")
            .send({ newEmail: "invalid-email" });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // -------------------------
    // SERVICE ERROR
    // -------------------------
    it("should propagate service error", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        changeEmailService.changeEmailTxService.mockRejectedValue(new Error("service error"));
        const res = await (0, supertest_1.default)(app)
            .patch("/users/email")
            .send({ newEmail: "new@mail.com" });
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
