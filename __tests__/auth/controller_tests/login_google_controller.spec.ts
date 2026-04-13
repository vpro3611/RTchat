import express from "express";
import request from "supertest";
import { LoginGoogleController, LoginGoogleBodySchema } from "../../../src/modules/authentification/controllers/login_google_controller";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { AuthService } from "../../../src/modules/authentification/auth_service";

describe("LoginGoogleController (HTTP)", () => {
    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        authService = {
            loginByGoogle: jest.fn()
        } as any;

        const controller = new LoginGoogleController(authService);

        app.post(
            "/auth/google/login",
            // validation middleware
            (req, res, next) => {
                const parsed = LoginGoogleBodySchema.safeParse(req.body);
                if (!parsed.success) {
                    return next(parsed.error);
                }
                req.body = parsed.data;
                next();
            },
            controller.loginGoogleController
        );

        app.use(errorMiddleware());
        return app;
    };

    beforeEach(() => {
        process.env.CLIENT_ID = "test-client-id";
    });

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

    it("should login successfully if user exists", async () => {
        const app = buildApp();
        authService.loginByGoogle.mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: userDTO,
            requiresRegistration: false,
            registrationToken: null
        });

        const res = await request(app)
            .post("/auth/google/login")
            .send({ idToken: "valid-token" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            accessToken: "access-token",
            user: userDTO
        });
        expect(res.headers["set-cookie"]).toBeDefined();
        expect(authService.loginByGoogle).toHaveBeenCalledWith("valid-token", "test-client-id");
    });

    it("should return requiresRegistration if user does not exist", async () => {
        const app = buildApp();
        authService.loginByGoogle.mockResolvedValue({
            accessToken: null,
            refreshToken: null,
            user: null,
            requiresRegistration: true,
            registrationToken: "reg-token"
        });

        const res = await request(app)
            .post("/auth/google/login")
            .send({ idToken: "new-user-token" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            requiresRegistration: true,
            registrationToken: "reg-token",
            message: "Account not found. Please complete registration."
        });
        expect(res.headers["set-cookie"]).toBeUndefined();
    });

    it("should return 400 if idToken is missing", async () => {
        const app = buildApp();
        const res = await request(app)
            .post("/auth/google/login")
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 500 if CLIENT_ID is missing", async () => {
        delete process.env.CLIENT_ID;
        const app = buildApp();
        const res = await request(app)
            .post("/auth/google/login")
            .send({ idToken: "token" });

        expect(res.status).toBe(500);
    });
});
