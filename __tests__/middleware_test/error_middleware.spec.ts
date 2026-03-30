import express from "express";
import request from "supertest";
import { errorMiddleware } from "../../src/modules/middlewares/error_middleware";

import {
    AuthentificationError,
    AuthorizationError,
    ConflictError,
    InternalServerError,
    NotFoundError,
    ValidationError
} from "../../src/http_errors_base";

import { z } from "zod";

describe("errorMiddleware (HTTP integration)", () => {

    const buildApp = (error: Error) => {
        const app = express();

        app.get("/test", () => {
            throw error;
        });

        app.use(errorMiddleware());

        return app;
    };

    // --------------------------
    // ZodError
    // --------------------------

    it("should return 400 for ZodError", async () => {

        const schema = z.object({
            email: z.string().email()
        });

        const result = schema.safeParse({ email: "bad" });

        const app = buildApp(result.error!);

        const res = await request(app).get("/test");

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // --------------------------
    // ValidationError
    // --------------------------

    it("should return 400 for ValidationError", async () => {

        const app = buildApp(new ValidationError("Invalid input"));

        const res = await request(app).get("/test");

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // --------------------------
    // AuthentificationError
    // --------------------------

    it("should return 401", async () => {

        const app = buildApp(new AuthentificationError("Unauthorized"));

        const res = await request(app).get("/test");

        expect(res.status).toBe(401);
        expect(res.body.code).toBe("AUTHENTIFICATION_ERROR");
    });

    // --------------------------
    // AuthorizationError
    // --------------------------

    it("should return 403", async () => {

        const app = buildApp(new AuthorizationError("Forbidden"));

        const res = await request(app).get("/test");

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    // --------------------------
    // NotFoundError
    // --------------------------

    it("should return 404", async () => {

        const app = buildApp(new NotFoundError("Not found"));

        const res = await request(app).get("/test");

        expect(res.status).toBe(404);
        expect(res.body.code).toBe("NOT_FOUND_ERROR");
    });

    // --------------------------
    // ConflictError
    // --------------------------

    it("should return 409", async () => {

        const app = buildApp(new ConflictError("Conflict"));

        const res = await request(app).get("/test");

        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });

    // --------------------------
    // InternalServerError
    // --------------------------

    it("should return 500 for InternalServerError", async () => {

        process.env.NODE_ENV = "development";

        const app = buildApp(new InternalServerError("DB crash"));

        const res = await request(app).get("/test");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("INTERNAL_SERVER_ERROR");
    });

    // --------------------------
    // Unexpected error
    // --------------------------

    it("should return 500 for unexpected error", async () => {

        const app = buildApp(new Error("Unexpected"));

        const res = await request(app).get("/test");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});