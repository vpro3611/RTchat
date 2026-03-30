"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const login_username_controller_1 = require("../../../src/modules/authentification/controllers/login_username_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
const http_errors_base_1 = require("../../../src/http_errors_base");
class TestAuthError extends http_errors_base_1.AuthentificationError {
}
describe("LoginUsernameController (HTTP)", () => {
    let authService;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        authService = {
            loginByUsername: jest.fn()
        };
        const controller = new login_username_controller_1.LoginUsernameController(authService);
        app.post("/login-username", 
        // Zod validation middleware
        (req, res, next) => {
            const parsed = login_username_controller_1.LoginUsernameBodySchema.safeParse(req.body);
            if (!parsed.success) {
                return next(parsed.error);
            }
            req.body = parsed.data;
            next();
        }, controller.loginUsernameController);
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
    it("should login successfully with username", async () => {
        const app = buildApp();
        authService.loginByUsername.mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: userDTO
        });
        const res = await (0, supertest_1.default)(app)
            .post("/login-username")
            .send({
            username: "testuser",
            password: "Password123!"
        });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            accessToken: "access-token",
            user: userDTO
        });
        expect(res.headers["set-cookie"]).toBeDefined();
        expect(authService.loginByUsername)
            .toHaveBeenCalledWith("testuser", "Password123!");
    });
    // -------------------------
    // VALIDATION ERROR
    // -------------------------
    it("should return 400 if username missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .post("/login-username")
            .send({
            password: "Password123!"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    it("should return 400 if password missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .post("/login-username")
            .send({
            username: "testuser"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // -------------------------
    // AUTH ERROR
    // -------------------------
    it("should return 401 if credentials invalid", async () => {
        const app = buildApp();
        authService.loginByUsername.mockRejectedValue(new TestAuthError("Invalid credentials"));
        const res = await (0, supertest_1.default)(app)
            .post("/login-username")
            .send({
            username: "testuser",
            password: "wrongPassword"
        });
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            code: "AUTHENTIFICATION_ERROR",
            message: "Invalid credentials"
        });
    });
});
