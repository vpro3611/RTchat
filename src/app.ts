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
import {GetSpecificMessageParamsSchema} from "./modules/chat/controllers/message/get_specific_message_controller";
import cors from "cors";
import multer from "multer";
import {GetSpecificUserParamsSchema} from "./modules/users/controllers/get_specific_user_controller";
import {
    ResendRegisterVerificationBodySchema
} from "./modules/users/controllers/resend_register_verification_controller";
import {BlockSpecificUserParamsSchema} from "./modules/users/controllers/block_specific_user_controller";
import {UnblockSpecificUserParamsSchema} from "./modules/users/controllers/unblock_specific_user_controller";
import {
    BanGroupParticipantBodySchema,
    BanGroupParticipantParamsSchema
} from "./modules/chat/controllers/participant/ban_group_participant_controller";
import {
    UnbanGroupParticipantParamsSchema
} from "./modules/chat/controllers/participant/unban_group_participant_controller";
import {GetBannedUsersParamsSchema} from "./modules/chat/controllers/participant/get_banned_users_controller";
import {
    ChangeRequestStatusBodySchema,
    ChangeRequestStatusParamsSchema
} from "./modules/chat/controllers/conversation_requests/change_conversation_request_status_controller";
import {
    CreateConversationRequestBodySchema,
    CreateConversationRequestParamsSchema
} from "./modules/chat/controllers/conversation_requests/create_conversation_request_controller";
import {
    GetAllRequestListParamsSchema
} from "./modules/chat/controllers/conversation_requests/get_all_request_list_controller";
import {
    GetSpecificRequestGroupParamsSchema
} from "./modules/chat/controllers/conversation_requests/get_specific_request_group_controller";
import {
    GetSpecificRequestUserParamsSchema
} from "./modules/chat/controllers/conversation_requests/get_specific_request_user_controller";
import {RemoveRequestParamsSchema} from "./modules/chat/controllers/conversation_requests/remove_request_controller";
import {
    WithdrawConversationRequestParamsSchema
} from "./modules/chat/controllers/conversation_requests/withdraw_conversation_request_controller";
import {
    AddParticipantToAConversationParamsSchema
} from "./modules/chat/controllers/participant/add_participant_to_a_conversation_controller";
import {SaveMessageParamsSchema} from "./modules/chat/controllers/saved_messages/save_message_controller";
import {
    RemoveSavedMessageParamsSchema
} from "./modules/chat/controllers/saved_messages/remove_saved_message_controller";
import {
    GetSpecificSavedMessageParamsSchema
} from "./modules/chat/controllers/saved_messages/get_specific_saved_message_controller";
import {SetConversationAvatarParamsSchema} from "./modules/chat/controllers/avatar/set_conversation_avatar_controller";
import {DeleteConversationAvatarParamsSchema} from "./modules/chat/controllers/avatar/delete_conversation_avatar_controller";
import {RestoreForgottenPasswordBodySchema} from "./modules/users/controllers/restore_forgotten_password_controller";
import {
    ResendResetForgottenPasswordBodySchema
} from "./modules/users/controllers/resend_reset_forgotten_password_controller";
import {
    ResetUserStatusToTrueBodySchema
} from "./modules/users/controllers/reset_user_status_to_true_controller";
import {
    ResendUserStatusToTrueBodySchema
} from "./modules/users/controllers/resend_user_status_to_true_controller";

export const createApp = (dependencies: AppContainer): Express => {
    const app = express();

    const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } });

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

    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:9000",
    ];

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
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
    }); //

    publicRouter.get("/avatar/:avatarId",
        dependencies.getAvatarController.execute
    ); //

    publicRouter.post("/register",
        validateBody(RegisterBodySchema),
        dependencies.registerController.registerController
    ); //

    publicRouter.post("/resend-register",
        validateBody(ResendRegisterVerificationBodySchema),
        dependencies.resendVerificationRegisterController.resendRegisterVerificationCont
    ); //

    publicRouter.post("/restore-forgotten-password",
        validateBody(RestoreForgottenPasswordBodySchema),
        dependencies.restoreForgottenPasswordController.restoreForgottenPasswordCont
    );

    publicRouter.get("/confirm-reset-password",
        dependencies.confirmResetPasswordController.confirmPasswordReset
    );

    publicRouter.post("/resend-reset-password",
        validateBody(ResendResetForgottenPasswordBodySchema),
        dependencies.resendForgottenPasswordController.resendResetForgottenPasswordCont
    );

    publicRouter.post("/reset-user-status",
        validateBody(ResetUserStatusToTrueBodySchema),
        dependencies.resetUserStatusToTrueController.resetUserStatusToTrueCont
    );

    publicRouter.get("/confirm-reset-activity",
        dependencies.confirmResetActivityController.confirmResetActivity
    );

    publicRouter.post("/resend-reset-activity",
        validateBody(ResendUserStatusToTrueBodySchema),
        dependencies.resendUserStatusToTrueController.resendUserStatusToTrueCont
    );

    publicRouter.post("/login-email",
        validateBody(LoginEmailBodySchema),
        dependencies.loginEmailController.loginEmailController
    ); //

    publicRouter.post("/login-username",
        validateBody(LoginUsernameBodySchema),
        dependencies.loginUsernameController.loginUsernameController
    ); //

    publicRouter.get("/verify-email",
        dependencies.verifyEmailController.verifyEmailController
    ); //

    publicRouter.get("/confirm-email-change",
        dependencies.confirmEmailChangeController.confirmEmailChangeCont
    ); //

    publicRouter.post("/refresh",
        dependencies.refreshController.refreshController
    ); //

    privateRouter.post("/logout",
        dependencies.logoutController.logoutController
    ); //

    privateRouter.get("/me",
        dependencies.getSelfProfileController.getSelfProfileCont
    ); //

    privateRouter.patch("/change-email",
        validateBody(ChangeEmailBodySchema),
        dependencies.changeEmailController.changeEmailController
    ); //

    privateRouter.patch("/change-password",
        validateBody(ChangePasswordBodySchema),
        dependencies.changePasswordController.changePasswordController
    ); //

    privateRouter.patch("/change-username",
        validateBody(ChangeUsernameBodySchema),
        dependencies.changeUsernameController.changeUsernameController
    ); //

    privateRouter.patch("/toggle-status",
        dependencies.toggleStatusController.toggleStatusController
    ); //

    privateRouter.post("/direct-conv/:targetId/create",
        validateParams(CreateDirectConversationParamsSchema),
        dependencies.createDirectConversationController.createDirectConversationCont
    ); //

    privateRouter.post("/group-conv/create",
        validateBody(CreateGroupConversationBodySchema),
        dependencies.createGroupConversationController.createGroupConversationCont
    ); //

    privateRouter.get("/conversations",
        dependencies.getUserConversationController.getUserConversationCont
    ); //

    privateRouter.patch("/conversation/:conversationId/title",
        validateParams(UpdateConversationTitleParamsSchema),
        validateBody(UpdateConversationTitleBodySchema),
        dependencies.updateConversationTitleController.updateConversationTitleCont
    ); //

    privateRouter.get("/conversation/:conversationId/messages",
        validateParams(GetMessagesParamsSchema),
        dependencies.getMessagesController.getMessagesCont
    ); //

    privateRouter.get("/conversation/:conversationId/:messageId/view",
        validateParams(GetSpecificMessageParamsSchema),
        dependencies.getSpecificMessageController.getSpecificMessageCont
    ); //

    privateRouter.patch("/conversation/:conversationId/:targetId/role",
        validateParams(ChangeParticipantRoleParamsSchema),
        dependencies.changeParticipantRoleController.changeParticipantRoleCont
    ); //

    privateRouter.get("/conversation/:conversationId/:targetId/get-full",
        validateParams(GetSpecificParticipantParamsSchema),
        dependencies.getSpecificParticipantController.getSpecificParticipantController
    ); //

    privateRouter.get("/conversation/:conversationId/participants",
        validateParams(GetParticipantsParamsSchema),
        dependencies.getParticipantsController.getParticipantsCont
    ); //

    privateRouter.post("/conversation/:conversationId/join",
        validateParams(JoinConversationParamsSchema),
        dependencies.joinConversationController.joinConversationCont
    ); //

    privateRouter.delete("/conversation/:conversationId/leave",
        validateParams(LeaveConversationParamsSchema),
        dependencies.leaveConversationController.leaveConversationCont
    ); //

    privateRouter.patch("/conversation/:conversationId/:targetId/mute",
        validateParams(MuteParticipantParamsSchema),
        validateBody(MuteParticipantBodySchema),
        dependencies.muteParticipantController.muteParticipantCont
    ); //

    privateRouter.delete("/conversation/:conversationId/:targetId/kick",
        validateParams(RemoveParticipantParamsSchema),
        dependencies.removeParticipantController.removeParticipantCont
    ); // TODO

    privateRouter.patch("/conversation/:conversationId/:targetId/unmute",
        validateParams(UnmuteParticipantParamsSchema),
        dependencies.unmuteParticipantController.unmuteParticipantCont
    ); //

    privateRouter.get("/search-conversations",
        dependencies.searchConversationsController.searchConversationsCont
    ); //

    privateRouter.get("/search-users",
        dependencies.searchUsersController.searchUsersController
    ); //

    privateRouter.get("/user/:targetId/view",
        validateParams(GetSpecificUserParamsSchema),
        dependencies.getSpecificUserController.getSpecificUserController
    ); //

    privateRouter.post("/resend-change-email",
        dependencies.resendVerificationChangeEmailController.resendChangeEmailVerificationCont
    ); //

    privateRouter.patch("/user/:targetId/block_user",
        validateParams(BlockSpecificUserParamsSchema),
        dependencies.blockSpecificUserController.blockSpecificUserCont
    ); //

    privateRouter.patch("/user/:targetId/unblock_user",
        validateParams(UnblockSpecificUserParamsSchema),
        dependencies.unblockSpecificUserController.unblockSpecificUserCont
    ); //

    privateRouter.get("/user/black_list",
        dependencies.getFullBlackListController.getFullBlackListController
    ); //

    privateRouter.post("/conversation/:conversationId/:targetId/ban",
        validateParams(BanGroupParticipantParamsSchema),
        validateBody(BanGroupParticipantBodySchema),
        dependencies.banParticipantController.banGroupParticipantCont
    ); //

    privateRouter.delete("/conversation/:conversationId/:targetId/unban",
        validateParams(UnbanGroupParticipantParamsSchema),
        dependencies.unbanParticipantController.unbanGroupParticipantCont
    ); //

    privateRouter.get("/conversation/:conversationId/ban_list",
        validateParams(GetBannedUsersParamsSchema),
        dependencies.getBannedUsersController.getBannedUserCont
    ); //

    privateRouter.patch("/conversation/:conversationId/requests/:requestId/status",
        validateParams(ChangeRequestStatusParamsSchema),
        validateBody(ChangeRequestStatusBodySchema),
        dependencies.changeConversationRequestStatusController.changeConversationRequestStatusCont
    ); //

    privateRouter.post("/conversation/:conversationId/requests/create",
        validateParams(CreateConversationRequestParamsSchema),
        validateBody(CreateConversationRequestBodySchema),
        dependencies.createConversationRequestController.createConvRequestCont
    ); //

    privateRouter.get("/conversation/:conversationId/requests/get_all",
        validateParams(GetAllRequestListParamsSchema),
        dependencies.getAllConversationRequestsController.getAllRequestListCont
    ); //

    privateRouter.get("/conversation/:conversationId/requests/:requestId/view",
        validateParams(GetSpecificRequestGroupParamsSchema),
        dependencies.getSpecificRequestGroupController.getSpecificRequestGroupCont
    ); //

    privateRouter.get("/private_requests/:requestId/view",
        validateParams(GetSpecificRequestUserParamsSchema),
        dependencies.getSpecificRequestUserController.getSpecificRequestUserController
    ); //

    privateRouter.get("/private_requests/view_all",
        dependencies.getUsersRequestsController.getUsersRequestCont
    ); //

    privateRouter.patch("/private_requests/:requestId/remove",
        validateParams(RemoveRequestParamsSchema),
        dependencies.removeConversationRequestController.removeRequestCont
    ); //

    privateRouter.patch("/private_requests/:requestId/withdraw",
        validateParams(WithdrawConversationRequestParamsSchema),
        dependencies.withdrawConversationRequestController.withdrawConversationRequestCont
    ); //

    privateRouter.post("/conversation/:conversationId/:targetId/force_add",
        validateParams(AddParticipantToAConversationParamsSchema),
        dependencies.addParticipantToConversationController.addParticipantToAConversationCont
    ); //

    privateRouter.post("/conversation/:conversationId/:messageId/save",
        validateParams(SaveMessageParamsSchema),
        dependencies.saveMessageController.saveMessageCont
    ); //

    privateRouter.delete("/user/saved_messages/:messageId/remove",
        validateParams(RemoveSavedMessageParamsSchema),
        dependencies.removeSavedMessageController.removeSavedMessageCont
    ); //

    privateRouter.get("/user/saved_messages/:messageId/view",
        validateParams(GetSpecificSavedMessageParamsSchema),
        dependencies.getSpecificSavedMessageController.getSpecificSavedMessageCont
    ); //

    privateRouter.get("/user/saved_messages/all",
        dependencies.getSavedMessagesListController.getSavedMessagesListCont
    ); //

    privateRouter.post("/me/avatar",
        upload.single('avatar'),
        dependencies.setUserAvatarController.setAvatar
    ); //

    privateRouter.delete("/me/avatar",
        dependencies.deleteUserAvatarController.deleteAvatar
    ); //

    privateRouter.post("/conversation/:conversationId/avatar",
        validateParams(SetConversationAvatarParamsSchema),
        upload.single('avatar'),
        dependencies.setConversationAvatarController.setAvatar
    ); //

    privateRouter.delete("/conversation/:conversationId/avatar",
        validateParams(DeleteConversationAvatarParamsSchema),
        dependencies.deleteConversationAvatarController.deleteAvatar
    ); //

    app.use(errorMiddleware());

    return app;
}