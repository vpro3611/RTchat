import express from "express";
import request from "supertest";

import { UnblockSpecificUserController, UnblockSpecificUserParamsSchema } from "../../../src/modules/users/controllers/unblock_specific_user_controller";
import { UnblockSpecificUserTxService } from "../../../src/modules/users/transactional_services/unblock_specific_user_tx_service";
import { ExtractUserIdFromReq } from "../../../src/modules/users/shared/extract_user_id_from_req";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { CannotBlockYourselfError, UnblockUserError, UserNotFoundError } from "../../../src/modules/users/errors/use_case_errors";

describe("UnblockSpecificUserController (HTTP)", () => {

    let unblockSpecificUserService: jest.Mocked<UnblockSpecificUserTxService>;
    let extractUserId: jest.Mocked<ExtractUserIdFromReq>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        unblockSpecificUserService = {
            unblockSpecificUserTxService: jest.fn()
        } as any;

        extractUserId = {
            extractUserId: jest.fn()
        } as any;

        const controller = new UnblockSpecificUserController(
            unblockSpecificUserService,
            extractUserId
        );

        app.patch(
            "/user/:targetId/unblock_user",

            // zod validation middleware
            (req, res, next) => {
                const parsed = UnblockSpecificUserParamsSchema.safeParse(req.params);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.params = parsed.data;
                next();
            },

            controller.unblockSpecificUserCont
        );

        app.use(errorMiddleware());

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

        const res = await request(app)
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
        const res = await request(app)
            .patch("/user//unblock_user");

        expect(res.status).toBe(404);
    });

    // -------------------------
    // SERVICE ERROR - CANNOT UNBLOCK SELF
    // -------------------------

    it("should return 409 if trying to unblock yourself", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("actor-id");

        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(
            new CannotBlockYourselfError("You cannot block yourself")
        );

        const res = await request(app)
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

        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(
            new UnblockUserError("Failed to unblock user, user not blocked by you")
        );

        const res = await request(app)
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

        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(
            new UserNotFoundError("User not found")
        );

        const res = await request(app)
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

        unblockSpecificUserService.unblockSpecificUserTxService.mockRejectedValue(
            new Error("unexpected error")
        );

        const res = await request(app)
            .patch("/user/target-id/unblock_user");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});
