"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const login_email_controller_1 = require("../../../src/modules/authentification/controllers/login_email_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
const http_errors_base_1 = require("../../../src/http_errors_base");
class TestAuthError extends http_errors_base_1.AuthentificationError {
}
describe("LoginEmailController (HTTP)", () => {
    let authService;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        authService = {
            loginByEmail: jest.fn()
        };
        const controller = new login_email_controller_1.LoginEmailController(authService);
        app.post("/login-email", 
        // validation middleware
        (req, res, next) => {
            const parsed = login_email_controller_1.LoginEmailBodySchema.safeParse(req.body);
            if (!parsed.success) {
                return next(parsed.error);
            }
            req.body = parsed.data;
            next();
        }, controller.loginEmailController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "test@mail.com",
        isActive: true,
        isVerified: true,
        avatarId: null,
        lastSeenAt: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should login successfully", async () => {
        const app = buildApp();
        authService.loginByEmail.mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: userDTO
        });
        const res = await (0, supertest_1.default)(app)
            .post("/login-email")
            .send({
            email: "test@mail.com",
            password: "Password123!"
        });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            accessToken: "access-token",
            user: userDTO
        });
        expect(res.headers["set-cookie"]).toBeDefined();
        expect(authService.loginByEmail)
            .toHaveBeenCalledWith("test@mail.com", "Password123!");
    });
    // -------------------------
    // ZOD VALIDATION
    // -------------------------
    it("should return 400 if email invalid", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .post("/login-email")
            .send({
            email: "bad-email",
            password: "Password123!"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    it("should return 400 if password missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .post("/login-email")
            .send({
            email: "test@mail.com"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // -------------------------
    // AUTH ERROR
    // -------------------------
    it("should return 401 if login fails", async () => {
        const app = buildApp();
        authService.loginByEmail.mockRejectedValue(new TestAuthError("Invalid credentials"));
        const res = await (0, supertest_1.default)(app)
            .post("/login-email")
            .send({
            email: "test@mail.com",
            password: "Password123!"
        });
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            code: "AUTHENTIFICATION_ERROR",
            message: "Invalid credentials"
        });
    });
});
