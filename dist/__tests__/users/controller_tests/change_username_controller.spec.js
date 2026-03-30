"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const change_username_controller_1 = require("../../../src/modules/users/controllers/change_username_controller");
const error_middleware_1 = require("../../../src/modules/middlewares/error_middleware");
describe("ChangeUsernameController (HTTP)", () => {
    let changeUsernameService;
    let extractUserId;
    const buildApp = () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        changeUsernameService = {
            changeUsernameTxService: jest.fn()
        };
        extractUserId = {
            extractUserId: jest.fn()
        };
        const controller = new change_username_controller_1.ChangeUsernameController(changeUsernameService, extractUserId);
        app.patch("/users/username", 
        // Zod validation
        (req, res, next) => {
            const parsed = change_username_controller_1.ChangeUsernameBodySchema.safeParse(req.body);
            if (!parsed.success) {
                return next(parsed.error);
            }
            req.body = parsed.data;
            next();
        }, controller.changeUsernameController);
        app.use((0, error_middleware_1.errorMiddleware)());
        return app;
    };
    const userDTO = {
        id: "user-id",
        username: "newUsername",
        email: "test@mail.com",
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
    it("should change username successfully", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        changeUsernameService.changeUsernameTxService.mockResolvedValue(userDTO);
        const res = await (0, supertest_1.default)(app)
            .patch("/users/username")
            .send({ newUsername: "newUsername" });
        expect(res.status).toBe(200);
        expect(res.body).toEqual(userDTO);
        expect(extractUserId.extractUserId).toHaveBeenCalled();
        expect(changeUsernameService.changeUsernameTxService)
            .toHaveBeenCalledWith("user-id", "newUsername");
    });
    // -------------------------
    // VALIDATION ERROR
    // -------------------------
    it("should return 400 if username missing", async () => {
        const app = buildApp();
        const res = await (0, supertest_1.default)(app)
            .patch("/users/username")
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });
    // -------------------------
    // SERVICE ERROR
    // -------------------------
    it("should propagate service error", async () => {
        const app = buildApp();
        extractUserId.extractUserId.mockReturnValue("user-id");
        changeUsernameService.changeUsernameTxService.mockRejectedValue(new Error("service error"));
        const res = await (0, supertest_1.default)(app)
            .patch("/users/username")
            .send({ newUsername: "newUsername" });
        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });
});
