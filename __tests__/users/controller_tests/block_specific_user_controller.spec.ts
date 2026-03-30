import express from "express";
import request from "supertest";

import { BlockSpecificUserController, BlockSpecificUserParamsSchema } from "../../../src/modules/users/controllers/block_specific_user_controller";
import { BlockSpecificUserTxService } from "../../../src/modules/users/transactional_services/block_specific_user_tx_service";
import { ExtractUserIdFromReq } from "../../../src/modules/users/shared/extract_user_id_from_req";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { CannotBlockYourselfError, BlockUserError, UserNotFoundError } from "../../../src/modules/users/errors/use_case_errors";

describe("BlockSpecificUserController (HTTP)", () => {

    let blockSpecificUserService: jest.Mocked<BlockSpecificUserTxService>;
    let extractUserId: jest.Mocked<ExtractUserIdFromReq>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        blockSpecificUserService = {
            blockSpecificUserTxService: jest.fn()
        } as any;

        extractUserId = {
            extractUserId: jest.fn()
        } as any;

        const controller = new BlockSpecificUserController(
            blockSpecificUserService,
            extractUserId
        );

        app.patch(
            "/user/:targetId/block_user",

            // zod validation middleware
            (req, res, next) => {
                const parsed = BlockSpecificUserParamsSchema.safeParse(req.params);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.params = parsed.data;
                next();
            },

            controller.blockSpecificUserCont
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

    it("should block user successfully", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("actor-id");

        blockSpecificUserService.blockSpecificUserTxService.mockResolvedValue(userDTO);

        const res = await request(app)
            .patch("/user/target-id/block_user");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(userDTO);

        expect(extractUserId.extractUserId).toHaveBeenCalled();

        expect(blockSpecificUserService.blockSpecificUserTxService)
            .toHaveBeenCalledWith("actor-id", "target-id");
    });

    // -------------------------
    // VALIDATION ERROR
    // -------------------------

    it("should return 404 if targetId is empty (Express routing)", async () => {

        const app = buildApp();

        // Express returns 404 for empty path segments, not 400
        const res = await request(app)
            .patch("/user//block_user");

        expect(res.status).toBe(404);
    });

    // -------------------------
    // SERVICE ERROR - CANNOT BLOCK SELF
    // -------------------------

    it("should return 409 if trying to block yourself", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("actor-id");

        blockSpecificUserService.blockSpecificUserTxService.mockRejectedValue(
            new CannotBlockYourselfError("You cannot block yourself")
        );

        const res = await request(app)
            .patch("/user/actor-id/block_user");

        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - ALREADY BLOCKED
    // -------------------------

    it("should return 409 if user already blocked", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("actor-id");

        blockSpecificUserService.blockSpecificUserTxService.mockRejectedValue(
            new BlockUserError("Failed to block user, user already blocked by you")
        );

        const res = await request(app)
            .patch("/user/target-id/block_user");

        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - USER NOT FOUND
    // -------------------------

    it("should return 404 if actor not found", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("actor-id");

        blockSpecificUserService.blockSpecificUserTxService.mockRejectedValue(
            new UserNotFoundError("User not found")
        );

        const res = await request(app)
            .patch("/user/target-id/block_user");

        expect(res.status).toBe(404);
        expect(res.body.code).toBe("NOT_FOUND_ERROR");
    });

    // -------------------------
    // SERVICE ERROR - UNEXPECTED
    // -------------------------

    it("should return 500 on unexpected error", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("actor-id");

        blockSpecificUserService.blockSpecificUserTxService.mockRejectedValue(
            new Error("unexpected error")
        );

        const res = await request(app)
            .patch("/user/target-id/block_user");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});
