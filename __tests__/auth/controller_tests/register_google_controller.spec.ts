import express from "express";
import request from "supertest";
import { RegisterGoogleController, RegisterGoogleBodySchema } from "../../../src/modules/authentification/controllers/register_google_controller";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { AuthService } from "../../../src/modules/authentification/auth_service";

describe("RegisterGoogleController (HTTP)", () => {
    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        authService = {
            registerByGoogle: jest.fn()
        } as any;

        const controller = new RegisterGoogleController(authService);

        app.post(
            "/auth/google/register",
            // validation middleware
            (req, res, next) => {
                const parsed = RegisterGoogleBodySchema.safeParse(req.body);
                if (!parsed.success) {
                    return next(parsed.error);
                }
                req.body = parsed.data;
                next();
            },
            controller.registerGoogleController
        );

        app.use(errorMiddleware());
        return app;
    };

    const userDTO = {
        id: "user-id",
        username: "googleuser",
        email: "google@mail.com",
        isActive: true,
        isVerified: true,
        avatarId: null,
        lastSeenAt: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    };

    it("should register successfully", async () => {
        const app = buildApp();
        authService.registerByGoogle.mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: userDTO
        });

        const res = await request(app)
            .post("/auth/google/register")
            .send({
                username: "googleuser",
                password: "StrongPassword123!",
                registrationToken: "reg-token"
            });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            accessToken: "access-token",
            user: userDTO
        });
        expect(res.headers["set-cookie"]).toBeDefined();
        expect(authService.registerByGoogle).toHaveBeenCalledWith("googleuser", "StrongPassword123!", "reg-token");
    });

    it("should return 400 if validation fails", async () => {
        const app = buildApp();
        const res = await request(app)
            .post("/auth/google/register")
            .send({
                username: "googleuser",
                // password missing
                registrationToken: "reg-token"
            });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
});
