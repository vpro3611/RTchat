import express from "express";
import request from "supertest";

import { ToggleStatusController } from "../../../src/modules/users/controllers/toggle_status_controller";
import { ToggleStatusTxService } from "../../../src/modules/users/transactional_services/toggle_status_tx_service";
import { ExtractUserIdFromReq } from "../../../src/modules/users/shared/extract_user_id_from_req";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";

describe("ToggleStatusController (HTTP)", () => {

    let toggleStatusService: jest.Mocked<ToggleStatusTxService>;
    let extractUserId: jest.Mocked<ExtractUserIdFromReq>;

    const buildApp = () => {
        const app = express();

        toggleStatusService = {
            toggleStatusTxService: jest.fn()
        } as any;

        extractUserId = {
            extractUserId: jest.fn()
        } as any;

        const controller = new ToggleStatusController(
            toggleStatusService,
            extractUserId
        );

        app.patch("/users/toggle-status", controller.toggleStatusController);

        app.use(errorMiddleware());

        return app;
    };

    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "test@mail.com",
        isActive: false,
        isVerified: true,
        lastSeenAt: "",
        createdAt: "",
        updated_at: ""
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should toggle user status successfully", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("user-id");

        toggleStatusService.toggleStatusTxService.mockResolvedValue(userDTO);

        const res = await request(app)
            .patch("/users/toggle-status");

        expect(res.status).toBe(200);

        expect(res.body).toEqual(userDTO);

        expect(extractUserId.extractUserId).toHaveBeenCalled();

        expect(toggleStatusService.toggleStatusTxService)
            .toHaveBeenCalledWith("user-id");
    });

    // -------------------------
    // SERVICE ERROR
    // -------------------------

    it("should propagate service error", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("user-id");

        toggleStatusService.toggleStatusTxService.mockRejectedValue(
            new Error("service error")
        );

        const res = await request(app)
            .patch("/users/toggle-status");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});