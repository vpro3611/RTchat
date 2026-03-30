"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const register_controller_1 = require("../../../src/modules/authentification/controllers/register_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
const http_errors_base_1 = require("../../../src/http_errors_base");
describe("RegisterController (HTTP)", () => {
    let authService;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        authService = {
            register: jest.fn()
        };
        const controller = new register_controller_1.RegisterController(authService);
        app.post("/register", 
        // Zod validation middleware
        (req, res, next) => {
            const parsed = register_controller_1.RegisterBodySchema.safeParse(req.body);
            if (!parsed.success) {
                return next(parsed.error);
            }
            req.body = parsed.data;
            next();
        }, controller.registerController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "test@mail.com",
        isActive: true,
        isVerified: false,
        avatarId: null,
        lastSeenAt: "",
        createdAt: "",
        updatedAt: ""
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should register user successfully", async () => {
        const app = buildApp();
        authService.register.mockResolvedValue({
            user: userDTO
        });
        const res = await (0, supertest_1.default)(app)
            .post("/register")
            .send({
            username: "testuser",
            email: "test@mail.com",
            password: "Password123!"
        });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            message: "User created successfully. Please verify your email.",
            user: userDTO
        });
        expect(authService.register)
            .toHaveBeenCalledWith("testuser", "test@mail.com", "Password123!");
    });
    // -------------------------
    // VALIDATION ERROR
    // -------------------------
    it("should return 400 if email invalid", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .post("/register")
            .send({
            username: "testuser",
            email: "invalid-email",
            password: "Password123!"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    it("should return 400 if username missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .post("/register")
            .send({
            email: "test@mail.com",
            password: "Password123!"
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // -------------------------
    // CONFLICT ERROR
    // -------------------------
    class TestConflictError extends http_errors_base_1.ConflictError {
    }
    it("should return 409 if username already exists", async () => {
        const app = buildApp();
        authService.register.mockRejectedValue(new TestConflictError("Username already exists"));
        const res = await (0, supertest_1.default)(app)
            .post("/register")
            .send({
            username: "testuser",
            email: "test@mail.com",
            password: "Password123!"
        });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({
            code: "CONFLICT_ERROR",
            message: "Username already exists"
        });
    });
});
