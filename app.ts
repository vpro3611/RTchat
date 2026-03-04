import {AppContainer} from "./container";
import express, {Express} from "express";
import cookieParser from "cookie-parser";
import {authMiddleware} from "./src/modules/authentification/auth_middleware/auth_middleware";
import {validateBody} from "./src/modules/middlewares/validate_body";
import {RegisterBodySchema} from "./src/modules/authentification/controllers/register_controller";
import {LoginEmailBodySchema} from "./src/modules/authentification/controllers/login_email_controller";
import {LoginUsernameBodySchema} from "./src/modules/authentification/controllers/login_username_controller";
import {errorMiddleware} from "./src/modules/middlewares/error_middleware";
import {ChangeEmailBodySchema} from "./src/modules/users/controllers/change_email_controller";
import {ChangePasswordBodySchema} from "./src/modules/users/controllers/change_password_controller";
import {ChangeUsernameBodySchema} from "./src/modules/users/controllers/change_username_controller";


export function createApp(dependencies: AppContainer): Express
{
    const app = express();

    // TODO : loger middleware here.

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    const publicRouter = express.Router();
    const privateRouter = express.Router();

    app.use("/public", publicRouter);
    app.use("/private", privateRouter);

    privateRouter.use(authMiddleware(dependencies.jwtTokenService))

    publicRouter.get("/health", (req, res) => {
        res.status(200).json({message: "OK"});
    })

    publicRouter.post("/register",
        validateBody(RegisterBodySchema),
        dependencies.registerController.registerController
    );

    publicRouter.post("/login-email",
        validateBody(LoginEmailBodySchema),
        dependencies.loginEmailController.loginEmailController
    );

    publicRouter.post("/login-username",
        validateBody(LoginUsernameBodySchema),
        dependencies.loginUsernameController.loginUsernameController
    );

    publicRouter.get("/verify-email",
        dependencies.verifyEmailController.verifyEmailController
    );

    publicRouter.get("/refresh",
        dependencies.refreshController.refreshController
    );

    privateRouter.post("/logout",
        dependencies.logoutController.logoutController
    );

    privateRouter.patch("/change-email",
        validateBody(ChangeEmailBodySchema),
        dependencies.changeEmailController.changeEmailController
    );

    privateRouter.patch("/change-password",
        validateBody(ChangePasswordBodySchema),
        dependencies.changePasswordController.changePasswordController
    );

    privateRouter.patch("/change-username",
        validateBody(ChangeUsernameBodySchema),
        dependencies.changeUsernameController.changeUsernameController
    );

    privateRouter.patch("/toggle-status",
        dependencies.toggleStatusController.toggleStatusController
    );




    app.use(errorMiddleware());
    return app;
}