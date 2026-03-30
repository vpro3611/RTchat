"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_middleware_1 = require("./modules/authentification/auth_middleware/auth_middleware");
const validate_body_1 = require("./modules/middlewares/validate_body");
const register_controller_1 = require("./modules/authentification/controllers/register_controller");
const login_email_controller_1 = require("./modules/authentification/controllers/login_email_controller");
const login_username_controller_1 = require("./modules/authentification/controllers/login_username_controller");
const error_middleware_1 = require("./modules/middlewares/error_middleware");
const change_email_controller_1 = require("./modules/users/controllers/change_email_controller");
const change_password_controller_1 = require("./modules/users/controllers/change_password_controller");
const change_username_controller_1 = require("./modules/users/controllers/change_username_controller");
const pino_http_1 = __importDefault(require("pino-http"));
const validate_params_1 = require("./modules/middlewares/validate_params");
const create_direct_conversation_controller_1 = require("./modules/chat/controllers/conversation/create_direct_conversation_controller");
const create_group_conversation_controller_1 = require("./modules/chat/controllers/conversation/create_group_conversation_controller");
const update_conversation_title_controller_1 = require("./modules/chat/controllers/conversation/update_conversation_title_controller");
const get_messages_controller_1 = require("./modules/chat/controllers/message/get_messages_controller");
const change_participant_role_controller_1 = require("./modules/chat/controllers/participant/change_participant_role_controller");
const get_participants_controller_1 = require("./modules/chat/controllers/participant/get_participants_controller");
const join_conversation_controller_1 = require("./modules/chat/controllers/participant/join_conversation_controller");
const leave_conversation_controller_1 = require("./modules/chat/controllers/participant/leave_conversation_controller");
const mute_participant_controller_1 = require("./modules/chat/controllers/participant/mute_participant_controller");
const remove_participant_controller_1 = require("./modules/chat/controllers/participant/remove_participant_controller");
const unmute_participant_controller_1 = require("./modules/chat/controllers/participant/unmute_participant_controller");
const get_specific_participant_controller_1 = require("./modules/chat/controllers/participant/get_specific_participant_controller");
const get_specific_message_controller_1 = require("./modules/chat/controllers/message/get_specific_message_controller");
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const get_specific_user_controller_1 = require("./modules/users/controllers/get_specific_user_controller");
const resend_register_verification_controller_1 = require("./modules/users/controllers/resend_register_verification_controller");
const block_specific_user_controller_1 = require("./modules/users/controllers/block_specific_user_controller");
const unblock_specific_user_controller_1 = require("./modules/users/controllers/unblock_specific_user_controller");
const ban_group_participant_controller_1 = require("./modules/chat/controllers/participant/ban_group_participant_controller");
const unban_group_participant_controller_1 = require("./modules/chat/controllers/participant/unban_group_participant_controller");
const get_banned_users_controller_1 = require("./modules/chat/controllers/participant/get_banned_users_controller");
const change_conversation_request_status_controller_1 = require("./modules/chat/controllers/conversation_requests/change_conversation_request_status_controller");
const create_conversation_request_controller_1 = require("./modules/chat/controllers/conversation_requests/create_conversation_request_controller");
const get_all_request_list_controller_1 = require("./modules/chat/controllers/conversation_requests/get_all_request_list_controller");
const get_specific_request_group_controller_1 = require("./modules/chat/controllers/conversation_requests/get_specific_request_group_controller");
const get_specific_request_user_controller_1 = require("./modules/chat/controllers/conversation_requests/get_specific_request_user_controller");
const remove_request_controller_1 = require("./modules/chat/controllers/conversation_requests/remove_request_controller");
const withdraw_conversation_request_controller_1 = require("./modules/chat/controllers/conversation_requests/withdraw_conversation_request_controller");
const add_participant_to_a_conversation_controller_1 = require("./modules/chat/controllers/participant/add_participant_to_a_conversation_controller");
const save_message_controller_1 = require("./modules/chat/controllers/saved_messages/save_message_controller");
const remove_saved_message_controller_1 = require("./modules/chat/controllers/saved_messages/remove_saved_message_controller");
const get_specific_saved_message_controller_1 = require("./modules/chat/controllers/saved_messages/get_specific_saved_message_controller");
const set_conversation_avatar_controller_1 = require("./modules/chat/controllers/avatar/set_conversation_avatar_controller");
const delete_conversation_avatar_controller_1 = require("./modules/chat/controllers/avatar/delete_conversation_avatar_controller");
function createApp(dependencies) {
    const app = (0, express_1.default)();
    const upload = (0, multer_1.default)({ limits: { fileSize: 2 * 1024 * 1024 } });
    // TODO : loger middleware here.
    app.use((0, pino_http_1.default)({
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
    app.use((0, cors_1.default)({
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
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    const publicRouter = express_1.default.Router();
    const privateRouter = express_1.default.Router();
    app.use("/public", publicRouter);
    app.use("/private", privateRouter);
    privateRouter.use((0, auth_middleware_1.authMiddleware)(dependencies.jwtTokenService));
    publicRouter.get("/health", (req, res) => {
        res.status(200).json({ message: "OK" });
    }); //
    publicRouter.get("/avatar/:avatarId", dependencies.getAvatarController.execute);
    publicRouter.post("/register", (0, validate_body_1.validateBody)(register_controller_1.RegisterBodySchema), dependencies.registerController.registerController); //
    publicRouter.post("/resend-register", (0, validate_body_1.validateBody)(resend_register_verification_controller_1.ResendRegisterVerificationBodySchema), dependencies.resendVerificationRegisterController.resendRegisterVerificationCont); //
    publicRouter.post("/login-email", (0, validate_body_1.validateBody)(login_email_controller_1.LoginEmailBodySchema), dependencies.loginEmailController.loginEmailController); //
    publicRouter.post("/login-username", (0, validate_body_1.validateBody)(login_username_controller_1.LoginUsernameBodySchema), dependencies.loginUsernameController.loginUsernameController); //
    publicRouter.get("/verify-email", dependencies.verifyEmailController.verifyEmailController); //
    publicRouter.get("/confirm-email-change", dependencies.confirmEmailChangeController.confirmEmailChangeCont); //
    publicRouter.post("/refresh", dependencies.refreshController.refreshController); //
    privateRouter.post("/logout", dependencies.logoutController.logoutController); //
    privateRouter.get("/me", dependencies.getSelfProfileController.getSelfProfileCont); //
    privateRouter.patch("/change-email", (0, validate_body_1.validateBody)(change_email_controller_1.ChangeEmailBodySchema), dependencies.changeEmailController.changeEmailController); //
    privateRouter.patch("/change-password", (0, validate_body_1.validateBody)(change_password_controller_1.ChangePasswordBodySchema), dependencies.changePasswordController.changePasswordController); //
    privateRouter.patch("/change-username", (0, validate_body_1.validateBody)(change_username_controller_1.ChangeUsernameBodySchema), dependencies.changeUsernameController.changeUsernameController); //
    privateRouter.patch("/toggle-status", dependencies.toggleStatusController.toggleStatusController); //
    privateRouter.post("/direct-conv/:targetId/create", (0, validate_params_1.validateParams)(create_direct_conversation_controller_1.CreateDirectConversationParamsSchema), dependencies.createDirectConversationController.createDirectConversationCont); //
    privateRouter.post("/group-conv/create", (0, validate_body_1.validateBody)(create_group_conversation_controller_1.CreateGroupConversationBodySchema), dependencies.createGroupConversationController.createGroupConversationCont); //
    privateRouter.get("/conversations", dependencies.getUserConversationController.getUserConversationCont); //
    privateRouter.patch("/conversation/:conversationId/title", (0, validate_params_1.validateParams)(update_conversation_title_controller_1.UpdateConversationTitleParamsSchema), (0, validate_body_1.validateBody)(update_conversation_title_controller_1.UpdateConversationTitleBodySchema), dependencies.updateConversationTitleController.updateConversationTitleCont); //
    privateRouter.get("/conversation/:conversationId/messages", (0, validate_params_1.validateParams)(get_messages_controller_1.GetMessagesParamsSchema), dependencies.getMessagesController.getMessagesCont); //
    privateRouter.get("/conversation/:conversationId/:messageId/view", (0, validate_params_1.validateParams)(get_specific_message_controller_1.GetSpecificMessageParamsSchema), dependencies.getSpecificMessageController.getSpecificMessageCont); //
    privateRouter.patch("/conversation/:conversationId/:targetId/role", (0, validate_params_1.validateParams)(change_participant_role_controller_1.ChangeParticipantRoleParamsSchema), dependencies.changeParticipantRoleController.changeParticipantRoleCont); //
    privateRouter.get("/conversation/:conversationId/:targetId/get-full", (0, validate_params_1.validateParams)(get_specific_participant_controller_1.GetSpecificParticipantParamsSchema), dependencies.getSpecificParticipantController.getSpecificParticipantController); //
    privateRouter.get("/conversation/:conversationId/participants", (0, validate_params_1.validateParams)(get_participants_controller_1.GetParticipantsParamsSchema), dependencies.getParticipantsController.getParticipantsCont); //
    privateRouter.post("/conversation/:conversationId/join", (0, validate_params_1.validateParams)(join_conversation_controller_1.JoinConversationParamsSchema), dependencies.joinConversationController.joinConversationCont); //
    privateRouter.delete("/conversation/:conversationId/leave", (0, validate_params_1.validateParams)(leave_conversation_controller_1.LeaveConversationParamsSchema), dependencies.leaveConversationController.leaveConversationCont); //
    privateRouter.patch("/conversation/:conversationId/:targetId/mute", (0, validate_params_1.validateParams)(mute_participant_controller_1.MuteParticipantParamsSchema), (0, validate_body_1.validateBody)(mute_participant_controller_1.MuteParticipantBodySchema), dependencies.muteParticipantController.muteParticipantCont); //
    privateRouter.delete("/conversation/:conversationId/:targetId/kick", (0, validate_params_1.validateParams)(remove_participant_controller_1.RemoveParticipantParamsSchema), dependencies.removeParticipantController.removeParticipantCont); // TODO
    privateRouter.patch("/conversation/:conversationId/:targetId/unmute", (0, validate_params_1.validateParams)(unmute_participant_controller_1.UnmuteParticipantParamsSchema), dependencies.unmuteParticipantController.unmuteParticipantCont); //
    privateRouter.get("/search-conversations", dependencies.searchConversationsController.searchConversationsCont); //
    privateRouter.get("/search-users", dependencies.searchUsersController.searchUsersController); //
    privateRouter.get("/user/:targetId/view", (0, validate_params_1.validateParams)(get_specific_user_controller_1.GetSpecificUserParamsSchema), dependencies.getSpecificUserController.getSpecificUserController); //
    privateRouter.post("/resend-change-email", dependencies.resendVerificationChangeEmailController.resendChangeEmailVerificationCont); //
    privateRouter.patch("/user/:targetId/block_user", (0, validate_params_1.validateParams)(block_specific_user_controller_1.BlockSpecificUserParamsSchema), dependencies.blockSpecificUserController.blockSpecificUserCont); //
    privateRouter.patch("/user/:targetId/unblock_user", (0, validate_params_1.validateParams)(unblock_specific_user_controller_1.UnblockSpecificUserParamsSchema), dependencies.unblockSpecificUserController.unblockSpecificUserCont); //
    privateRouter.get("/user/black_list", dependencies.getFullBlackListController.getFullBlackListController); //
    privateRouter.post("/conversation/:conversationId/:targetId/ban", (0, validate_params_1.validateParams)(ban_group_participant_controller_1.BanGroupParticipantParamsSchema), (0, validate_body_1.validateBody)(ban_group_participant_controller_1.BanGroupParticipantBodySchema), dependencies.banParticipantController.banGroupParticipantCont); //
    privateRouter.delete("/conversation/:conversationId/:targetId/unban", (0, validate_params_1.validateParams)(unban_group_participant_controller_1.UnbanGroupParticipantParamsSchema), dependencies.unbanParticipantController.unbanGroupParticipantCont); //
    privateRouter.get("/conversation/:conversationId/ban_list", (0, validate_params_1.validateParams)(get_banned_users_controller_1.GetBannedUsersParamsSchema), dependencies.getBannedUsersController.getBannedUserCont); //
    privateRouter.patch("/conversation/:conversationId/requests/:requestId/status", (0, validate_params_1.validateParams)(change_conversation_request_status_controller_1.ChangeRequestStatusParamsSchema), (0, validate_body_1.validateBody)(change_conversation_request_status_controller_1.ChangeRequestStatusBodySchema), dependencies.changeConversationRequestStatusController.changeConversationRequestStatusCont); //
    privateRouter.post("/conversation/:conversationId/requests/create", (0, validate_params_1.validateParams)(create_conversation_request_controller_1.CreateConversationRequestParamsSchema), (0, validate_body_1.validateBody)(create_conversation_request_controller_1.CreateConversationRequestBodySchema), dependencies.createConversationRequestController.createConvRequestCont); //
    privateRouter.get("/conversation/:conversationId/requests/get_all", (0, validate_params_1.validateParams)(get_all_request_list_controller_1.GetAllRequestListParamsSchema), dependencies.getAllConversationRequestsController.getAllRequestListCont); //
    privateRouter.get("/conversation/:conversationId/requests/:requestId/view", (0, validate_params_1.validateParams)(get_specific_request_group_controller_1.GetSpecificRequestGroupParamsSchema), dependencies.getSpecificRequestGroupController.getSpecificRequestGroupCont); //
    privateRouter.get("/private_requests/:requestId/view", (0, validate_params_1.validateParams)(get_specific_request_user_controller_1.GetSpecificRequestUserParamsSchema), dependencies.getSpecificRequestUserController.getSpecificRequestUserController); //
    privateRouter.get("/private_requests/view_all", dependencies.getUsersRequestsController.getUsersRequestCont); //
    privateRouter.patch("/private_requests/:requestId/remove", (0, validate_params_1.validateParams)(remove_request_controller_1.RemoveRequestParamsSchema), dependencies.removeConversationRequestController.removeRequestCont); //
    privateRouter.patch("/private_requests/:requestId/withdraw", (0, validate_params_1.validateParams)(withdraw_conversation_request_controller_1.WithdrawConversationRequestParamsSchema), dependencies.withdrawConversationRequestController.withdrawConversationRequestCont); //
    privateRouter.post("/conversation/:conversationId/:targetId/force_add", (0, validate_params_1.validateParams)(add_participant_to_a_conversation_controller_1.AddParticipantToAConversationParamsSchema), dependencies.addParticipantToConversationController.addParticipantToAConversationCont); //
    privateRouter.post("/conversation/:conversationId/:messageId/save", (0, validate_params_1.validateParams)(save_message_controller_1.SaveMessageParamsSchema), dependencies.saveMessageController.saveMessageCont); //
    privateRouter.delete("/user/saved_messages/:messageId/remove", (0, validate_params_1.validateParams)(remove_saved_message_controller_1.RemoveSavedMessageParamsSchema), dependencies.removeSavedMessageController.removeSavedMessageCont); //
    privateRouter.get("/user/saved_messages/:messageId/view", (0, validate_params_1.validateParams)(get_specific_saved_message_controller_1.GetSpecificSavedMessageParamsSchema), dependencies.getSpecificSavedMessageController.getSpecificSavedMessageCont); //
    privateRouter.get("/user/saved_messages/all", dependencies.getSavedMessagesListController.getSavedMessagesListCont); //
    privateRouter.post("/me/avatar", upload.single('avatar'), dependencies.setUserAvatarController.setAvatar);
    privateRouter.delete("/me/avatar", dependencies.deleteUserAvatarController.deleteAvatar);
    privateRouter.post("/conversation/:conversationId/avatar", (0, validate_params_1.validateParams)(set_conversation_avatar_controller_1.SetConversationAvatarParamsSchema), upload.single('avatar'), dependencies.setConversationAvatarController.setAvatar);
    privateRouter.delete("/conversation/:conversationId/avatar", (0, validate_params_1.validateParams)(delete_conversation_avatar_controller_1.DeleteConversationAvatarParamsSchema), dependencies.deleteConversationAvatarController.deleteAvatar);
    app.use((0, error_middleware_1.errorMiddleware)());
    return app;
}
