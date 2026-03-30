"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const refresh_controller_1 = require("../../../src/modules/authentification/controllers/refresh_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
describe("RefreshController (HTTP)", () => {
    let authService;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        authService = {
            refresh: jest.fn()
        };
        const controller = new refresh_controller_1.RefreshController(authService);
        app.post("/refresh", controller.refreshController);
        app.use((0, error_middleware_1.errorMiddleware)());
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
        const res = await (0, supertest_1.default)(app)
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
        const refreshCookie = cookieArray.find((c) => c.startsWith("refreshToken="));
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toContain("HttpOnly");
    });
    // -------------------------
    // MISSING COOKIE
    // -------------------------
    it("should return 401 if refresh token missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
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
        const res = await (0, supertest_1.default)(app)
            .post("/refresh")
            .set("Cookie", ["refreshToken=invalid"]);
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
