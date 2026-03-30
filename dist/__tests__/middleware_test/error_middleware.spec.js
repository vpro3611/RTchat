"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const error_middleware_1 = require("../../src/modules/middlewares/error_middleware");
const http_errors_base_1 = require("../../src/http_errors_base");
const zod_1 = require("zod");
describe("errorMiddleware (HTTP integration)", () => {
    const buildApp = (error) => {
        const app = (0, express_1.default)();
        app.get("/test", () => {
            throw error;
        });
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    // --------------------------
    // ZodError
    // --------------------------
    it("should return 400 for ZodError", async () => {
        const schema = zod_1.z.object({
            email: zod_1.z.string().email()
        });
        const result = schema.safeParse({ email: "bad" });
        const app = buildApp(result.error);
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // --------------------------
    // ValidationError
    // --------------------------
    it("should return 400 for ValidationError", async () => {
        const app = buildApp(new http_errors_base_1.ValidationError("Invalid input"));
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // --------------------------
    // AuthentificationError
    // --------------------------
    it("should return 401", async () => {
        const app = buildApp(new http_errors_base_1.AuthentificationError("Unauthorized"));
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(401);
        expect(res.body.code).toBe("AUTHENTIFICATION_ERROR");
    });
    // --------------------------
    // AuthorizationError
    // --------------------------
    it("should return 403", async () => {
        const app = buildApp(new http_errors_base_1.AuthorizationError("Forbidden"));
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });
    // --------------------------
    // NotFoundError
    // --------------------------
    it("should return 404", async () => {
        const app = buildApp(new http_errors_base_1.NotFoundError("Not found"));
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(404);
        expect(res.body.code).toBe("NOT_FOUND_ERROR");
    });
    // --------------------------
    // ConflictError
    // --------------------------
    it("should return 409", async () => {
        const app = buildApp(new http_errors_base_1.ConflictError("Conflict"));
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });
    // --------------------------
    // InternalServerError
    // --------------------------
    it("should return 500 for InternalServerError", async () => {
        process.env.NODE_ENV = "development";
        const app = buildApp(new http_errors_base_1.InternalServerError("DB crash"));
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("INTERNAL_SERVER_ERROR");
    });
    // --------------------------
    // Unexpected error
    // --------------------------
    it("should return 500 for unexpected error", async () => {
        const app = buildApp(new Error("Unexpected"));
        const res = await (0, supertest_1.default)(app).get("/test");
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
