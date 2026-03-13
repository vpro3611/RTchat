import {AppContainer} from "./container";
import express, {Express} from "express";
import cookieParser from "cookie-parser";
import {authMiddleware} from "./modules/authentification/auth_middleware/auth_middleware";
import {validateBody} from "./modules/middlewares/validate_body";
import {RegisterBodySchema} from "./modules/authentification/controllers/register_controller";
import {LoginEmailBodySchema} from "./modules/authentification/controllers/login_email_controller";
import {LoginUsernameBodySchema} from "./modules/authentification/controllers/login_username_controller";
import {errorMiddleware} from "./modules/middlewares/error_middleware";
import {ChangeEmailBodySchema} from "./modules/users/controllers/change_email_controller";
import {ChangePasswordBodySchema} from "./modules/users/controllers/change_password_controller";
import {ChangeUsernameBodySchema} from "./modules/users/controllers/change_username_controller";
import pinoHttp from "pino-http";
import {validateParams} from "./modules/middlewares/validate_params";
import {
    CreateDirectConversationParamsSchema
} from "./modules/chat/controllers/conversation/create_direct_conversation_controller";
import {
    CreateGroupConversationBodySchema
} from "./modules/chat/controllers/conversation/create_group_conversation_controller";
import {
    UpdateConversationTitleBodySchema,
    UpdateConversationTitleParamsSchema
} from "./modules/chat/controllers/conversation/update_conversation_title_controller";
import {GetMessagesParamsSchema} from "./modules/chat/controllers/message/get_messages_controller";
import {
    ChangeParticipantRoleParamsSchema
} from "./modules/chat/controllers/participant/change_participant_role_controller";
import {
    GetParticipantsController,
    GetParticipantsParamsSchema
} from "./modules/chat/controllers/participant/get_participants_controller";
import {JoinConversationParamsSchema} from "./modules/chat/controllers/participant/join_conversation_controller";
import {LeaveConversationParamsSchema} from "./modules/chat/controllers/participant/leave_conversation_controller";
import {
    MuteParticipantBodySchema,
    MuteParticipantParamsSchema
} from "./modules/chat/controllers/participant/mute_participant_controller";
import {RemoveParticipantParamsSchema} from "./modules/chat/controllers/participant/remove_participant_controller";
import {UnmuteParticipantParamsSchema} from "./modules/chat/controllers/participant/unmute_participant_controller";
import {
    GetSpecificParticipantParamsSchema
} from "./modules/chat/controllers/participant/get_specific_participant_controller";

export function createApp(dependencies: AppContainer): Express
{
    const app = express();

    // TODO : loger middleware here.
    app.use(pinoHttp({
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
            }
        },
    }));
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

    privateRouter.post("/direct-conv/:targetId/create",
        validateParams(CreateDirectConversationParamsSchema),
        dependencies.createDirectConversationController.createDirectConversationCont
    );

    privateRouter.post("/group-conv/create",
        validateBody(CreateGroupConversationBodySchema),
        dependencies.createGroupConversationController.createGroupConversationCont
    );

    privateRouter.get("/conversations",
        dependencies.getUserConversationController.getUserConversationCont
    );

    privateRouter.patch("/conversation/:conversationId/title",
        validateParams(UpdateConversationTitleParamsSchema),
        validateBody(UpdateConversationTitleBodySchema),
        dependencies.updateConversationTitleController.updateConversationTitleCont
    );

    privateRouter.get("/conversation/:conversationId/messages",
        validateParams(GetMessagesParamsSchema),
        dependencies.getMessagesController.getMessagesCont
    );

    privateRouter.patch("/conversation/:conversationId/:targetId/role",
        validateParams(ChangeParticipantRoleParamsSchema),
        dependencies.changeParticipantRoleController.changeParticipantRoleCont
    );

    privateRouter.get("/conversation/:conversationId/:targetId/get-full",
        validateParams(GetSpecificParticipantParamsSchema),
        dependencies.getSpecificParticipantController.getSpecificParticipantController
    );

    privateRouter.get("/conversation/:conversationId/participants",
        validateParams(GetParticipantsParamsSchema),
        dependencies.getParticipantsController.getParticipantsCont
    );

    privateRouter.post("/conversation/:conversationId/join",
        validateParams(JoinConversationParamsSchema),
        dependencies.joinConversationController.joinConversationCont
    );

    privateRouter.delete("/conversation/:conversationId/leave",
        validateParams(LeaveConversationParamsSchema),
        dependencies.leaveConversationController.leaveConversationCont
    );

    privateRouter.patch("/conversation/:conversationId/:targetId/mute",
        validateParams(MuteParticipantParamsSchema),
        validateBody(MuteParticipantBodySchema),
        dependencies.muteParticipantController.muteParticipantCont
    );

    privateRouter.delete("/conversation/:conversationId/:targetId/kick",
        validateParams(RemoveParticipantParamsSchema),
        dependencies.removeParticipantController.removeParticipantCont
    );

    privateRouter.patch("/conversation/:conversationId/:targetId/unmute",
        validateParams(UnmuteParticipantParamsSchema),
        dependencies.unmuteParticipantController.unmuteParticipantCont
    );

    app.use(errorMiddleware());

    return app;
}