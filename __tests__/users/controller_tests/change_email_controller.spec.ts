import express from "express";
import request from "supertest";

import { ChangeEmailController, ChangeEmailBodySchema } from "../../../src/modules/users/controllers/change_email_controller";
import { ChangeEmailTxService } from "../../../src/modules/users/transactional_services/change_email_tx_service";
import { ExtractUserIdFromReq } from "../../../src/modules/users/shared/extract_user_id_from_req";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";

describe("ChangeEmailController (HTTP)", () => {

    let changeEmailService: jest.Mocked<ChangeEmailTxService>;
    let extractUserId: jest.Mocked<ExtractUserIdFromReq>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        changeEmailService = {
            changeEmailTxService: jest.fn()
        } as any;

        extractUserId = {
            extractUserId: jest.fn()
        } as any;

        const controller = new ChangeEmailController(
            changeEmailService,
            extractUserId
        );

        app.patch(
            "/users/email",

            // zod validation middleware
            (req, res, next) => {
                const parsed = ChangeEmailBodySchema.safeParse(req.body);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.body = parsed.data;
                next();
            },

            controller.changeEmailController
        );

        app.use(errorMiddleware());

        return app;
    };

    const userDTO = {
        id: "user-id",
        username: "testuser",
        email: "new@mail.com",
        isActive: true,
        isVerified: true,
        lastSeenAt: "",
        createdAt: "",
        updatedAt: ""
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should change email successfully", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("user-id");

        changeEmailService.changeEmailTxService.mockResolvedValue(userDTO);

        const res = await request(app)
            .patch("/users/email")
            .send({ newEmail: "new@mail.com" });

        expect(res.status).toBe(200);

        expect(res.body).toEqual(userDTO);

        expect(extractUserId.extractUserId).toHaveBeenCalled();

        expect(changeEmailService.changeEmailTxService)
            .toHaveBeenCalledWith("user-id", "new@mail.com");
    });

    // -------------------------
    // VALIDATION ERROR
    // -------------------------

    it("should return 400 if email invalid", async () => {

        const app = buildApp();

        const res = await request(app)
            .patch("/users/email")
            .send({ newEmail: "invalid-email" });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    // -------------------------
    // SERVICE ERROR
    // -------------------------

    it("should propagate service error", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("user-id");

        changeEmailService.changeEmailTxService.mockRejectedValue(
            new Error("service error")
        );

        const res = await request(app)
            .patch("/users/email")
            .send({ newEmail: "new@mail.com" });

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});
