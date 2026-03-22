import express from "express";
import request from "supertest";

import { LoginUsernameController, LoginUsernameBodySchema } from "../../../src/modules/authentification/controllers/login_username_controller";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { AuthService } from "../../../src/modules/authentification/auth_service";

import { AuthentificationError } from "../../../src/http_errors_base";

class TestAuthError extends AuthentificationError {}

describe("LoginUsernameController (HTTP)", () => {

    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        authService = {
            loginByUsername: jest.fn()
        } as any;

        const controller = new LoginUsernameController(authService);

        app.post(
            "/login-username",

            // Zod validation middleware
            (req, res, next) => {
                const parsed = LoginUsernameBodySchema.safeParse(req.body);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.body = parsed.data;
                next();
            },

            controller.loginUsernameController
        );

        app.use(errorMiddleware());

        return app;
    };

    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "test@mail.com",
        isActive: true,
        isVerified: true,
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

        const res = await request(app)
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

        const res = await request(app)
            .post("/login-username")
            .send({
                password: "Password123!"
            });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 if password missing", async () => {

        const app = buildApp();

        const res = await request(app)
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

        authService.loginByUsername.mockRejectedValue(
            new TestAuthError("Invalid credentials")
        );

        const res = await request(app)
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