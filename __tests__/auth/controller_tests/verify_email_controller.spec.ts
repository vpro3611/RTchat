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

        expect(res.status).toBe(200);

        expect(res.body).toEqual({
            message: "Email verified successfully"
        });

        expect(authService.verifyEmail)
            .toHaveBeenCalledWith("valid-token");
    });

    // -------------------------
    // INVALID TOKEN FORMAT
    // -------------------------

    it("should return 400 if token missing", async () => {

        const app = buildApp();

        const res = await request(app)
            .get("/verify-email");

        expect(res.status).toBe(400);

        expect(res.body).toEqual({
            message: "Invalid or expired token"
        });
    });

    // -------------------------
    // SERVICE ERROR
    // -------------------------

    it("should return 400 if verification fails", async () => {

        const app = buildApp();

        authService.verifyEmail.mockRejectedValue(
            new Error("token expired")
        );

        const res = await request(app)
            .get("/verify-email")
            .query({ token: "expired-token" });

        expect(res.status).toBe(400);

        expect(res.body).toEqual({
            message: "Invalid or expired token"
        });
    });

});