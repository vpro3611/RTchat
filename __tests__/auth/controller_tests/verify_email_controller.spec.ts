import express from "express";
import request from "supertest";

import { VerifyEmailController } from "../../../src/modules/authentification/controllers/verify_email_controller";
import { AuthService } from "../../../src/modules/authentification/auth_service";

describe("VerifyEmailController (HTTP)", () => {

    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {
        const app = express();

        authService = {
            verifyEmail: jest.fn()
        } as any;

        const controller = new VerifyEmailController(authService);

        app.get("/verify-email", controller.verifyEmailController);

        return app;
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should verify email successfully", async () => {

        const app = buildApp();

        authService.verifyEmail.mockResolvedValue(undefined);

        const res = await request(app)
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

        const res = await request(app)
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

        authService.verifyEmail.mockRejectedValue(
            new Error("token expired")
        );

        const res = await request(app)
            .get("/verify-email")
            .query({ token: "expired-token" });

        expect(res.status).toBe(302);

        expect(res.headers.location).toContain("email-verified");
        expect(res.headers.location).toContain("status=error");
        expect(res.headers.location).toContain("type=register");
    });

});