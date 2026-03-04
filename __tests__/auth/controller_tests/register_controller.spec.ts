import express from "express";
import request from "supertest";

import { RegisterController, RegisterBodySchema } from "../../../src/modules/authentification/controllers/register_controller";
import { AuthService } from "../../../src/modules/authentification/auth_service";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { ConflictError } from "../../../src/http_errors_base";

describe("RegisterController (HTTP)", () => {

    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        authService = {
            register: jest.fn()
        } as any;

        const controller = new RegisterController(authService);

        app.post(
            "/register",

            // Zod validation middleware
            (req, res, next) => {
                const parsed = RegisterBodySchema.safeParse(req.body);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.body = parsed.data;
                next();
            },

            controller.registerController
        );

        app.use(errorMiddleware());

        return app;
    };

    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "test@mail.com",
        isActive: true,
        isVerified: false,
        lastSeenAt: "",
        createdAt: "",
        updated_at: ""
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should register user successfully", async () => {

        const app = buildApp();

        authService.register.mockResolvedValue({
            user: userDTO
        });

        const res = await request(app)
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

        const res = await request(app)
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

        const res = await request(app)
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

    class TestConflictError extends ConflictError {}

    it("should return 409 if username already exists", async () => {

        const app = buildApp();

        authService.register.mockRejectedValue(
            new TestConflictError("Username already exists")
        );

        const res = await request(app)
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