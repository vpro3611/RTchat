import express from "express";
import request from "supertest";

import { ChangePasswordController, ChangePasswordBodySchema } from "../../../src/modules/users/controllers/change_password_controller";
import { ChangePasswordTxService } from "../../../src/modules/users/transactional_services/change_password_tx_service";
import { ExtractUserIdFromReq } from "../../../src/modules/users/shared/extract_user_id_from_req";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";

describe("ChangePasswordController (HTTP)", () => {

    let changePasswordService: jest.Mocked<ChangePasswordTxService>;
    let extractUserId: jest.Mocked<ExtractUserIdFromReq>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        changePasswordService = {
            changePasswordTxService: jest.fn()
        } as any;

        extractUserId = {
            extractUserId: jest.fn()
        } as any;

        const controller = new ChangePasswordController(
            changePasswordService,
            extractUserId
        );

        app.patch(
            "/users/password",

            // Zod validation
            (req, res, next) => {
                const parsed = ChangePasswordBodySchema.safeParse(req.body);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.body = parsed.data;
                next();
            },

            controller.changePasswordController
        );

        app.use(errorMiddleware());

        return app;
    };

    const responseDTO = {
        id: "user-id",
        username: "testuser",
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

    it("should change password successfully", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("user-id");

        changePasswordService.changePasswordTxService.mockResolvedValue(responseDTO);

        const res = await request(app)
            .patch("/users/password")
            .send({
                oldPassword: "OldPass123!",
                newPassword: "NewPass123!"
            });

        expect(res.status).toBe(200);

        expect(res.body).toEqual(responseDTO);

        expect(extractUserId.extractUserId).toHaveBeenCalled();

        expect(changePasswordService.changePasswordTxService)
            .toHaveBeenCalledWith(
                "user-id",
                "OldPass123!",
                "NewPass123!"
            );
    });

    // -------------------------
    // VALIDATION ERROR
    // -------------------------

    it("should return 400 if body invalid", async () => {

        const app = buildApp();

        const res = await request(app)
            .patch("/users/password")
            .send({
                oldPassword: "123"
            });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR
    // -------------------------

    it("should propagate service error", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("user-id");

        changePasswordService.changePasswordTxService.mockRejectedValue(
            new Error("service error")
        );

        const res = await request(app)
            .patch("/users/password")
            .send({
                oldPassword: "OldPass123!",
                newPassword: "NewPass123!"
            });

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});