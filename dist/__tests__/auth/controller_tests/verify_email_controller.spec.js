"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const verify_email_controller_1 = require("../../../src/modules/authentification/controllers/verify_email_controller");
describe("VerifyEmailController (HTTP)", () => {
    let authService;
    const buildApp = () => {
        const app = (0, express_1.default)();
        authService = {
            verifyEmail: jest.fn()
        };
        const controller = new verify_email_controller_1.VerifyEmailController(authService);
        app.get("/verify-email", controller.verifyEmailController);
        return app;
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should verify email successfully", async () => {
        const app = buildApp();
        authService.verifyEmail.mockResolvedValue(undefined);
        const res = await (0, supertest_1.default)(app)
            .get("/verify-email")
            .query({ token: "valid-token" });
        expect(res.status).toBe(302);
        expect(res.headers.location).toContain("email-verified");
        expect(res.headers.location).toContain("status=success");
        expect(res.headers.location).toContain("type=register");
        expect(authService.verifyEmail)
            .toHaveBeenCalledWith("valid-token");
    });
    // -------------------------
    // INVALID TOKEN FORMAT
    // -------------------------
    it("should return 302 with error if token missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .get("/verify-email");
        expect(res.status).toBe(302);
        expect(res.headers.location).toContain("email-verified");
        expect(res.headers.location).toContain("status=error");
        expect(res.headers.location).toContain("type=register");
    });
    // -------------------------
    // SERVICE ERROR
    // -------------------------
    it("should return 302 with error if verification fails", async () => {
        const app = buildApp();
        authService.verifyEmail.mockRejectedValue(new Error("token expired"));
        const res = await (0, supertest_1.default)(app)
            .get("/verify-email")
            .query({ token: "expired-token" });
        expect(res.status).toBe(302);
        expect(res.headers.location).toContain("email-verified");
        expect(res.headers.location).toContain("status=error");
        expect(res.headers.location).toContain("type=register");
    });
});
