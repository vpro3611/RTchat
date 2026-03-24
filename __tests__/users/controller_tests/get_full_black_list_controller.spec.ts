import express from "express";
import request from "supertest";

import { GetFullBlackListController } from "../../../src/modules/users/controllers/get_full_black_list_controller";
import { GetFullBlackListTxService } from "../../../src/modules/users/transactional_services/get_full_black_list_tx_service";
import { ExtractUserIdFromReq } from "../../../src/modules/users/shared/extract_user_id_from_req";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";
import { UserNotFoundError } from "../../../src/modules/users/errors/use_case_errors";
import { NotActiveOrVerifiedError } from "../../../src/modules/users/errors/user_domain_errors";

describe("GetFullBlackListController (HTTP)", () => {

    let getFullBlackListService: jest.Mocked<GetFullBlackListTxService>;
    let extractUserId: jest.Mocked<ExtractUserIdFromReq>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        getFullBlackListService = {
            getFullBlackListTxService: jest.fn()
        } as any;

        extractUserId = {
            extractUserId: jest.fn()
        } as any;

        const controller = new GetFullBlackListController(
            getFullBlackListService,
            extractUserId
        );

        app.get(
            "/user/black_list",
            controller.getFullBlackListController
        );

        app.use(errorMiddleware());

        return app;
    };

    const blacklistDTO = [
        {
            id: "blocked-user-1",
            username: "blockeduser1",
            email: "blocked1@test.com",
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

        const res = await request(app)
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

        const res = await request(app)
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

        getFullBlackListService.getFullBlackListTxService.mockRejectedValue(
            new UserNotFoundError("User not found")
        );

        const res = await request(app)
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

        getFullBlackListService.getFullBlackListTxService.mockRejectedValue(
            new NotActiveOrVerifiedError("User testuser is not active or not verified")
        );

        const res = await request(app)
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

        getFullBlackListService.getFullBlackListTxService.mockRejectedValue(
            new Error("unexpected error")
        );

        const res = await request(app)
            .get("/user/black_list");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});
