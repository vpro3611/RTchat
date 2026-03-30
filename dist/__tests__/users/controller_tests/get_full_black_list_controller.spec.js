"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const get_full_black_list_controller_1 = require("../../../src/modules/users/controllers/get_full_black_list_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
const use_case_errors_1 = require("../../../src/modules/users/errors/use_case_errors");
const user_domain_errors_1 = require("../../../src/modules/users/errors/user_domain_errors");
describe("GetFullBlackListController (HTTP)", () => {
    let getFullBlackListService;
    let extractUserId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        getFullBlackListService = {
            getFullBlackListTxService: jest.fn()
        };
        extractUserId = {
            extractUserId: jest.fn()
        };
        const controller = new get_full_black_list_controller_1.GetFullBlackListController(getFullBlackListService, extractUserId);
        app.get("/user/black_list", controller.getFullBlackListController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const blacklistDTO = [
        {
            id: "blocked-user-1",
            username: "blockeduser1",
            email: "blocked1@test.com",
            avatarId: null,
            isActive: true,
            isVerified: true,
            lastSeenAt: "",
            createdAt: "",
            updatedAt: ""
        },
        {
            id: "blocked-user-2",
            username: "blockeduser2",
            email: "blocked2@test.com",
            avatarId: null,
            isActive: true,
            isVerified: true,
            lastSeenAt: "",
            createdAt: "",
            updatedAt: ""
        }
    ];
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should return blacklist successfully", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        getFullBlackListService.getFullBlackListTxService.mockResolvedValue(blacklistDTO);
        const res = await (0, supertest_1.default)(app)
            .get("/user/black_list");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(blacklistDTO);
        expect(res.body.length).toBe(2);
        expect(extractUserId.extractUserId).toHaveBeenCalled();
        expect(getFullBlackListService.getFullBlackListTxService)
            .toHaveBeenCalledWith("actor-id");
    });
    // -------------------------
    // SUCCESS - EMPTY LIST
    // -------------------------
    it("should return empty array when no users blocked", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        getFullBlackListService.getFullBlackListTxService.mockResolvedValue([]);
        const res = await (0, supertest_1.default)(app)
            .get("/user/black_list");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
    // -------------------------
    // SERVICE ERROR - USER NOT FOUND
    // -------------------------
    it("should return 404 if actor not found", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        getFullBlackListService.getFullBlackListTxService.mockRejectedValue(new use_case_errors_1.UserNotFoundError("User not found"));
        const res = await (0, supertest_1.default)(app)
            .get("/user/black_list");
        expect(res.status).toBe(404);
        expect(res.body.code).toBe("NOT_FOUND_ERROR");
    });
    // -------------------------
    // SERVICE ERROR - USER NOT VERIFIED OR NOT ACTIVE
    // -------------------------
    it("should return 403 if user is not verified (AuthorizationError)", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        getFullBlackListService.getFullBlackListTxService.mockRejectedValue(new user_domain_errors_1.NotActiveOrVerifiedError("User testuser is not active or not verified"));
        const res = await (0, supertest_1.default)(app)
            .get("/user/black_list");
        // NotActiveOrVerifiedError extends AuthorizationError -> 403
        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });
    // -------------------------
    // SERVICE ERROR - UNEXPECTED
    // -------------------------
    it("should return 500 on unexpected error", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        getFullBlackListService.getFullBlackListTxService.mockRejectedValue(new Error("unexpected error"));
        const res = await (0, supertest_1.default)(app)
            .get("/user/black_list");
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
