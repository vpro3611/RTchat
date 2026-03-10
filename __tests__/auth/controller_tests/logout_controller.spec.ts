import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";

import { LogoutController } from "../../../src/modules/authentification/controllers/logout_controller";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { AuthService } from "../../../src/modules/authentification/auth_service";

describe("LogoutController (HTTP)", () => {
    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());
        app.use(cookieParser());

        authService = {
            logout: jest.fn(),
        } as any;

        const controller = new LogoutController(authService);

        app.post("/logout", controller.logoutController);

        app.use(errorMiddleware());

        return app;
    };

    // -------------------------
    // SUCCESS
    // -------------------------
    it("should logout successfully and clear refresh cookie", async () => {
        const app = buildApp();

        authService.logout.mockResolvedValue(undefined);

        const res = await request(app)
            .post("/logout")
            .set("Cookie", ["refreshToken=test-refresh-token"]);

        expect(res.status).toBe(204);

        expect(authService.logout).toHaveBeenCalledWith("test-refresh-token");

        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();

        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

        const clearCookie = cookieArray.find((c: string) =>
            c.startsWith("refreshToken=")
        );

        expect(clearCookie).toBeDefined();
        expect(clearCookie).toContain("Expires=Thu, 01 Jan 1970");
    });

    // -------------------------
    // MISSING TOKEN
    // -------------------------
    it("should return 401 if refresh token missing", async () => {
        const app = buildApp();

        const res = await request(app)
            .post("/logout");

        expect(res.status).toBe(401);

        expect(res.body.code).toBe("AUTHENTIFICATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR
    // -------------------------
    it("should propagate authService error", async () => {
        const app = buildApp();

        authService.logout.mockRejectedValue(new Error("db failure"));

        const res = await request(app)
            .post("/logout")
            .set("Cookie", ["refreshToken=test-refresh-token"]);

        expect(res.status).toBe(500);

        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});