import express from "express";
import request from "supertest";

import { authMiddleware } from "../../src/modules/authentification/auth_middleware/auth_middleware";
import { TokenServiceJWT } from "../../src/modules/authentification/jwt_token_service/token_service";

describe("authMiddleware", () => {

    let jwtService: jest.Mocked<TokenServiceJWT>;

    const buildApp = () => {

        const app = express();

        jwtService = {
            verifyAccessToken: jest.fn()
        } as any;

        app.get(
            "/protected",
            authMiddleware(jwtService),
            (req, res) => {

                res.status(200).json({
                    user: req.user
                });
            }
        );

        return app;
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should allow request with valid token", async () => {

        const app = buildApp();

        jwtService.verifyAccessToken.mockReturnValue({
            sub: "user-id"
        } as any);

        const res = await request(app)
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

        const res = await request(app)
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

        const res = await request(app)
            .get("/protected")
            .set("Authorization", "Basic token");

        expect(res.status).toBe(401);

        expect(res.body).toEqual({
            message: "Unauthorized"
        });
    });

    it("should return 401 if token missing", async () => {

        const app = buildApp();

        const res = await request(app)
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

        const res = await request(app)
            .get("/protected")
            .set("Authorization", "Bearer bad-token");

        expect(res.status).toBe(401);

        expect(res.body).toEqual({
            message: "Invalid or expired token"
        });
    });

});