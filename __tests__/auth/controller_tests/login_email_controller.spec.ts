import express from "express";
import request from "supertest";
import { LoginEmailController, LoginEmailBodySchema } from "../../../src/modules/authentification/controllers/login_email_controller";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { AuthService } from "../../../src/modules/authentification/auth_service";
import { AuthentificationError } from "../../../src/http_errors_base";

class TestAuthError extends AuthentificationError {}

describe("LoginEmailController (HTTP)", () => {

    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {

        const app = express();
        app.use(express.json());

        authService = {
            loginByEmail: jest.fn()
        } as any;

        const controller = new LoginEmailController(authService);

        app.post(
            "/login-email",

            // validation middleware
            (req, res, next) => {
                const parsed = LoginEmailBodySchema.safeParse(req.body);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.body = parsed.data;
                next();
            },

            controller.loginEmailController
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

        const res = await request(app)
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

        const res = await request(app)
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

        const res = await request(app)
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

        authService.loginByEmail.mockRejectedValue(
            new TestAuthError("Invalid credentials")
        );

        const res = await request(app)
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