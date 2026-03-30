import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";

import { RefreshController } from "../../../src/modules/authentification/controllers/refresh_controller";
import { AuthService } from "../../../src/modules/authentification/auth_service";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";

describe("RefreshController (HTTP)", () => {

    let authService: jest.Mocked<AuthService>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());
        app.use(cookieParser());

        authService = {
            refresh: jest.fn()
        } as any;

        const controller = new RefreshController(authService);

        app.post("/refresh", controller.refreshController);

        app.use(errorMiddleware());

        return app;
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should refresh tokens successfully", async () => {

        const app = buildApp();

        authService.refresh.mockResolvedValue({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token"
        });

        const res = await request(app)
            .post("/refresh")
            .set("Cookie", ["refreshToken=old-refresh-token"]);

        expect(res.status).toBe(200);

        expect(res.body).toEqual({
            accessToken: "new-access-token"
        });

        expect(authService.refresh)
            .toHaveBeenCalledWith("old-refresh-token");

        const cookies = res.headers["set-cookie"];
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

        const refreshCookie = cookieArray.find((c: string) =>
            c.startsWith("refreshToken=")
        );

        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toContain("HttpOnly");
    });

    // -------------------------
    // MISSING COOKIE
    // -------------------------

    it("should return 401 if refresh token missing", async () => {

        const app = buildApp();

        const res = await request(app)
            .post("/refresh");

        expect(res.status).toBe(401);
        expect(res.body.code).toBe("AUTHENTIFICATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR
    // -------------------------

    it("should propagate service error", async () => {

        const app = buildApp();

        authService.refresh.mockRejectedValue(new Error("invalid token"));

        const res = await request(app)
            .post("/refresh")
            .set("Cookie", ["refreshToken=invalid"]);

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});