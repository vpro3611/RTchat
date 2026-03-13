import express from "express";
import request from "supertest";

import { ChangeUsernameController, ChangeUsernameBodySchema } from "../../../src/modules/users/controllers/change_username_controller";
import { ChangeUsernameTxService } from "../../../src/modules/users/transactional_services/change_username_tx_service";
import { ExtractUserIdFromReq } from "../../../src/modules/users/shared/extract_user_id_from_req";
import { errorMiddleware } from "../../../src/modules/middlewares/error_middleware";

describe("ChangeUsernameController (HTTP)", () => {

    let changeUsernameService: jest.Mocked<ChangeUsernameTxService>;
    let extractUserId: jest.Mocked<ExtractUserIdFromReq>;

    const buildApp = () => {
        const app = express();
        app.use(express.json());

        changeUsernameService = {
            changeUsernameTxService: jest.fn()
        } as any;

        extractUserId = {
            extractUserId: jest.fn()
        } as any;

        const controller = new ChangeUsernameController(
            changeUsernameService,
            extractUserId
        );

        app.patch(
            "/users/username",

            // Zod validation
            (req, res, next) => {
                const parsed = ChangeUsernameBodySchema.safeParse(req.body);

                if (!parsed.success) {
                    return next(parsed.error);
                }

                req.body = parsed.data;
                next();
            },

            controller.changeUsernameController
        );

        app.use(errorMiddleware());

        return app;
    };

    const userDTO = {
        id: "user-id",
        username: "newUsername",
        email: "test@mail.com",
        isActive: true,
        isVerified: true,
        lastSeenAt: "",
        createdAt: "",
        updated_at: ""
    };

    // -------------------------
    // SUCCESS
    // -------------------------

    it("should change username successfully", async () => {

        const app = buildApp();

        extractUserId.extractUserId.mockReturnValue("user-id");

        changeUsernameService.changeUsernameTxService.mockResolvedValue(userDTO);

        const res = await request(app)
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

        const res = await request(app)
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

        changeUsernameService.changeUsernameTxService.mockRejectedValue(
            new Error("service error")
        );

        const res = await request(app)
            .patch("/users/username")
            .send({ newUsername: "newUsername" });

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("UNEXPECTED_ERROR");
    });

});