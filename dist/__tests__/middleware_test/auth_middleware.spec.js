"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const auth_middleware_1 = require("../../src/modules/authentification/auth_middleware/auth_middleware");
describe("authMiddleware", () => {
    let jwtService;
    const buildApp = () => {
        const app = (0, express_1.default)();
        jwtService = {
            verifyAccessToken: jest.fn()
        };
        app.get("/protected", (0, auth_middleware_1.authMiddleware)(jwtService), (req, res) => {
            res.status(200).json({
                user: req.user
            });
        });
        return app;
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should allow request with valid token", async () => {
        const app = buildApp();
        jwtService.verifyAccessToken.mockReturnValue({
            sub: "user-id"
        });
        const res = await (0, supertest_1.default)(app)
            .get("/protected")
            .set("Authorization", "Bearer valid-token");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            user: { sub: "user-id" }
        });
        expect(jwtService.verifyAccessToken)
            .toHaveBeenCalledWith("valid-token");
    });
    // -------------------------
    // MISSING HEADER
    // -------------------------
    it("should return 401 if authorization header missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .get("/protected");
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            message: "Unauthorized"
        });
    });
    // -------------------------
    // INVALID HEADER FORMAT
    // -------------------------
    it("should return 401 if header not Bearer", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .get("/protected")
            .set("Authorization", "Basic token");
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            message: "Unauthorized"
        });
    });
    it("should return 401 if token missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .get("/protected")
            .set("Authorization", "Bearer");
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            message: "Unauthorized"
        });
    });
    // -------------------------
    // INVALID TOKEN
    // -------------------------
    it("should return 401 if token invalid", async () => {
        const app = buildApp();
        jwtService.verifyAccessToken.mockImplementation(() => {
            throw new Error("invalid token");
        });
        const res = await (0, supertest_1.default)(app)
            .get("/protected")
            .set("Authorization", "Bearer bad-token");
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            message: "Invalid or expired token"
        });
    });
});
