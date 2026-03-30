"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const unblock_specific_user_controller_1 = require("../../../src/modules/users/controllers/unblock_specific_user_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
const use_case_errors_1 = require("../../../src/modules/users/errors/use_case_errors");
describe("UnblockSpecificUserController (HTTP)", () => {
    let unblockSpecificUserService;
    let extractUserId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        unblockSpecificUserService = {
            unblockSpecificUserTxService: jest.fn()
        };
        extractUserId = {
            extractUserId: jest.fn()
        };
        const controller = new unblock_specific_user_controller_1.UnblockSpecificUserController(unblockSpecificUserService, extractUserId);
        app.patch("/user/:targetId/unblock_user", 
        // zod validation middleware
        (req, res, next) => {
            const parsed = unblock_specific_user_controller_1.UnblockSpecificUserParamsSchema.safeParse(req.params);
            if (!parsed.success) {
                return next(parsed.error);
            }
            req.params = parsed.data;
            next();
        }, controller.unblockSpecificUserCont);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const userDTO = {
        id: "target-id",
        username: "targetuser",
        email: "target@test.com",
        isActive: true,
        isVerified: true,
        avatarId: null,
        lastSeenAt: "",
        createdAt: "",
        updatedAt: ""
    };
    // -------------------------
    // SUCCESS
    // -------------------------
    it("should unblock user successfully", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        unblockSpecificUserService.unblockSpecificUserTxService.mockResolvedValue(userDTO);
        const res = await (0, supertest_1.default)(app)
            .patch("/user/target-id/unblock_user");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(userDTO);
        expect(extractUserId.extractUserId).toHaveBeenCalled();
        expect(unblockSpecificUserService.unblockSpecificUserTxService)
            .toHaveBeenCalledWith("actor-id", "target-id");
    });
    // -------------------------
    // VALIDATION ERROR
    // -------------------------
    it("should return 404 if targetId is empty (Express routing)", async () => {
        const app = buildApp();
        // Express returns 404 for empty path segments, not 400
        const res = await (0, supertest_1.default)(app)
            .patch("/user//unblock_user");
        expect(res.status).toBe(404);
    });
    // -------------------------
    // SERVICE ERROR - CANNOT UNBLOCK SELF
    // -------------------------
    it("should return 409 if trying to unblock yourself", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(new use_case_errors_1.CannotBlockYourselfError("You cannot block yourself"));
        const res = await (0, supertest_1.default)(app)
            .patch("/user/actor-id/unblock_user");
        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });
    // -------------------------
    // SERVICE ERROR - USER NOT BLOCKED
    // -------------------------
    it("should return 409 if user is not blocked", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(new use_case_errors_1.UnblockUserError("Failed to unblock user, user not blocked by you"));
        const res = await (0, supertest_1.default)(app)
            .patch("/user/target-id/unblock_user");
        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });
    // -------------------------
    // SERVICE ERROR - USER NOT FOUND
    // -------------------------
    it("should return 404 if actor not found", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(new use_case_errors_1.UserNotFoundError("User not found"));
        const res = await (0, supertest_1.default)(app)
            .patch("/user/target-id/unblock_user");
        expect(res.status).toBe(404);
        expect(res.body.code).toBe("NOT_FOUND_ERROR");
    });
    // -------------------------
    // SERVICE ERROR - UNEXPECTED
    // -------------------------
    it("should return 500 on unexpected error", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("actor-id");
        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(new Error("unexpected error"));
        const res = await (0, supertest_1.default)(app)
            .patch("/user/target-id/unblock_user");
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
