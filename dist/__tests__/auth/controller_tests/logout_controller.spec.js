"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logout_controller_1 = require("../../../src/modules/authentification/controllers/logout_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
describe("LogoutController (HTTP)", () => {
    let authService;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        authService = {
            logout: jest.fn(),
        };
        const controller = new logout_controller_1.LogoutController(authService);
        app.post("/logout", controller.logoutController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should logout successfully and clear refresh cookie", async () => {
        const app = buildApp();
        authService.logout.mockResolvedValue(undefined);
        const res = await (0, supertest_1.default)(app)
            .post("/logout")
            .set("Cookie", ["refreshToken=test-refresh-token"]);
        expect(res.status).toBe(204);
        expect(authService.logout).toHaveBeenCalledWith("test-refresh-token");
        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        const clearCookie = cookieArray.find((c) => c.startsWith("refreshToken="));
        expect(clearCookie).toBeDefined();
        expect(clearCookie).toContain("Expires=Thu, 01 Jan 1970");
    });
    // -------------------------
    // MISSING TOKEN
    // -------------------------
    it("should return 401 if refresh token missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
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
        const res = await (0, supertest_1.default)(app)
            .post("/logout")
            .set("Cookie", ["refreshToken=test-refresh-token"]);
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
