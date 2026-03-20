import {TransactionManager} from "./modules/infrasctructure/ports/transaction_manager/transaction_manager";
import {pool} from "./database";
import {UserRepoReaderPg} from "./modules/users/repositories/user_repo_reader_pg";
import {UserRepoWriterPg} from "./modules/users/repositories/user_repo_writer_pg";
import {
    EmailVerificationTokenRepoPg
} from "./modules/infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg";
import {RefreshTokenRepoPg} from "./modules/authentification/refresh_token_repo/refresh_token_repo_pg";
import {ChangeEmailUseCase} from "./modules/users/application/change_email_use_case";
import {UserMapper} from "./modules/users/shared/map_to_dto";
import {UserLookup} from "./modules/users/shared/user_exists_by_id";
import {ChangePasswordUseCase} from "./modules/users/application/change_password_use_case";
import {Bcrypter} from "./modules/infrasctructure/ports/bcrypter/bcrypter";
import {ChangeUsernameUseCase} from "./modules/users/application/change_username_use_case";
import {LoginEmailUseCase} from "./modules/users/application/login_email_use_case";
import {LoginUsernameUseCase} from "./modules/users/application/login_username_use_case";
import {RegisterUseCase} from "./modules/users/application/register_use_case";
import {EmailSenderNodemailer} from "./modules/infrasctructure/ports/email_verif_infra/email_sender/email_sender";
import {ToggleIsActiveUseCase} from "./modules/users/application/toggle_status_use_case";
import {ChangeEmailTxService} from "./modules/users/transactional_services/change_email_tx_service";
import {ChangePasswordTxService} from "./modules/users/transactional_services/change_password_tx_service";
import {ChangeUsernameTxService} from "./modules/users/transactional_services/change_username_tx_service";
import {ToggleStatusTxService} from "./modules/users/transactional_services/toggle_status_tx_service";
import {
    EmailVerificationUseCase
} from "./modules/infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case";
import {AuthService} from "./modules/authentification/auth_service";
import {TokenServiceJWT} from "./modules/authentification/jwt_token_service/token_service";
import {LoginEmailController} from "./modules/authentification/controllers/login_email_controller";
import {LoginUsernameController} from "./modules/authentification/controllers/login_username_controller";
import {LogoutController} from "./modules/authentification/controllers/logout_controller";
import {RefreshController} from "./modules/authentification/controllers/refresh_controller";
import {RegisterController} from "./modules/authentification/controllers/register_controller";
import {VerifyEmailController} from "./modules/authentification/controllers/verify_email_controller";
import {ChangeEmailController} from "./modules/users/controllers/change_email_controller";
import {ExtractUserIdFromReq} from "./modules/users/shared/extract_user_id_from_req";
import {ChangePasswordController} from "./modules/users/controllers/change_password_controller";
import {ChangeUsernameController} from "./modules/users/controllers/change_username_controller";
import {ToggleStatusController} from "./modules/users/controllers/toggle_status_controller";
import {CacheService} from "./modules/infrasctructure/ports/cache_service/cache_service";
import {redisClient} from "./modules/infrasctructure/ports/cache_service/reddis_client";
import {ConversationRepositoryPg} from "./modules/chat/repositories_pg_realization/conversation_repository_pg";
import {MessageRepositoryPg} from "./modules/chat/repositories_pg_realization/message_repository_pg";
import {ParticipantRepositoryPg} from "./modules/chat/repositories_pg_realization/participant_repository_pg";
import {
    CreateDirectConversationUseCase
} from "./modules/chat/application/conversation/create_direct_conversation_use_case";
import {MapToConversationDto} from "./modules/chat/shared/map_to_conversation_dto";
import {
    CreateGroupConversationUseCase
} from "./modules/chat/application/conversation/create_group_conversation_use_case";
import {GetUserConversationsUseCase} from "./modules/chat/application/conversation/get_user_conversations_use_case";
import {MarkConversationReadUseCase} from "./modules/chat/application/conversation/mark_conversation_read_use_case";
import {
    UpdateConversationTitleUseCase
} from "./modules/chat/application/conversation/update_conversation_title_use_case";
import {CheckIsParticipant} from "./modules/chat/shared/is_participant";
import {DeleteMessageUseCase} from "./modules/chat/application/message/delete_message_use_case";
import {MapToMessage} from "./modules/chat/shared/map_to_message";
import {FindMessageById} from "./modules/chat/shared/find_message_by_id";
import {EditMessageUseCase} from "./modules/chat/application/message/edit_message_use_case";
import {GetMessagesUseCase} from "./modules/chat/application/message/get_messages_use_case";
import {SendMessageUseCase} from "./modules/chat/application/message/send_message_use_case";
import {ChangeParticipantRoleUseCase} from "./modules/chat/application/participant/change_participant_role_use_case";
import {MapToParticipantDto} from "./modules/chat/shared/map_to_participant_dto";
import {GetParticipantsUseCase} from "./modules/chat/application/participant/get_participants_use_case";
import {JoinConversationUseCase} from "./modules/chat/application/participant/join_conversation_use_case";
import {LeaveConversationUseCase} from "./modules/chat/application/participant/leave_conversation_use_case";
import {MuteParticipantUseCase} from "./modules/chat/application/participant/mute_participant_use_case";
import {RemoveParticipantUseCase} from "./modules/chat/application/participant/remove_participant_use_case";
import {UnmuteParticipantUseCase} from "./modules/chat/application/participant/unmute_participant_use_case";
import {
    CreateDirectConversationTxService
} from "./modules/chat/transactional_services/conversation/create_direct_conversation_service";
import {
    GetUserConversationsTxService
} from "./modules/chat/transactional_services/conversation/get_user_conversations_service";
import {
    CreateGroupConversationTxService
} from "./modules/chat/transactional_services/conversation/create_group_conversation_service";
import {
    MarkConversationReadTxService
} from "./modules/chat/transactional_services/conversation/mark_conversation_read_service";
import {
    UpdateConversationTitleTxService
} from "./modules/chat/transactional_services/conversation/update_conversation_title_service";
import {DeleteMessageTxService} from "./modules/chat/transactional_services/message/delete_message_service";
import {EditMessageTxService} from "./modules/chat/transactional_services/message/edit_message_service";
import {GetMessageTxService} from "./modules/chat/transactional_services/message/get_messages_service";
import {SendMessageTxService} from "./modules/chat/transactional_services/message/send_message_service";
import {
    ChangeParticipantRoleTxService
} from "./modules/chat/transactional_services/participant/change_participant_role_service";
import {GetParticipantsTxService} from "./modules/chat/transactional_services/participant/get_participants_service";
import {JoinConversationTxService} from "./modules/chat/transactional_services/participant/join_conversation_service";
import {LeaveConversationTxService} from "./modules/chat/transactional_services/participant/leave_conversation_service";
import {MuteParticipantTxService} from "./modules/chat/transactional_services/participant/mute_participant_service";
import {UnmuteParticipantTxService} from "./modules/chat/transactional_services/participant/unmute_participant_service";
import {RemoveParticipantTxService} from "./modules/chat/transactional_services/participant/remove_participant_service";
import {
    DeleteMessageController
} from "./modules/chat/web_socket_controllers/message_controllers/delete_message_controller";
import {EditMessageController} from "./modules/chat/web_socket_controllers/message_controllers/edit_message_controller";
import {SendMessageController} from "./modules/chat/web_socket_controllers/message_controllers/send_message_controller";
import {
    MarkConversationAsReadController
} from "./modules/chat/web_socket_controllers/message_controllers/read_message_controller";
import {StartTypingController} from "./modules/chat/web_socket_controllers/typing_controllers/start_typing_controller";
import {StopTypingController} from "./modules/chat/web_socket_controllers/typing_controllers/stop_typing_controller";
import {ExtractActorId} from "./modules/chat/shared/extract_actor_id_req";
import {
    CreateDirectConversationController
} from "./modules/chat/controllers/conversation/create_direct_conversation_controller";
import {
    CreateGroupConversationController
} from "./modules/chat/controllers/conversation/create_group_conversation_controller";
import {JoinConversationController} from "./modules/chat/controllers/participant/join_conversation_controller";
import {GetUserConversationController} from "./modules/chat/controllers/conversation/get_user_conversation_controller";
import {
    UpdateConversationTitleController
} from "./modules/chat/controllers/conversation/update_conversation_title_controller";
import {GetMessagesController} from "./modules/chat/controllers/message/get_messages_controller";
import {
    ChangeParticipantRoleController
} from "./modules/chat/controllers/participant/change_participant_role_controller";
import {LeaveConversationController} from "./modules/chat/controllers/participant/leave_conversation_controller";
import {MuteParticipantController} from "./modules/chat/controllers/participant/mute_participant_controller";
import {RemoveParticipantController} from "./modules/chat/controllers/participant/remove_participant_controller";
import {UnmuteParticipantController} from "./modules/chat/controllers/participant/unmute_participant_controller";
import {GetParticipantsController} from "./modules/chat/controllers/participant/get_participants_controller";
import {GetSpecificParticipantUseCase} from "./modules/chat/application/participant/get_specific_participant_use_case";
import {
    GetSpecificParticipantService
} from "./modules/chat/transactional_services/participant/get_specific_participant_service";
import {
    GetSpecificParticipantController
} from "./modules/chat/controllers/participant/get_specific_participant_controller";
import {GetSpecificMessageUseCase} from "./modules/chat/application/message/get_specific_message_use_case";
import {GetSpecificMessageService} from "./modules/chat/transactional_services/message/get_specific_message_service";
import {GetSpecificMessageController} from "./modules/chat/controllers/message/get_specific_message_controller";
import {GetSelfProfileUseCase} from "./modules/users/application/get_self_profile_use_case";
import {GetSelfProfileTxService} from "./modules/users/transactional_services/get_self_profile_tx_service";
import {GetSelfProfileController} from "./modules/users/controllers/get_self_profile_controller";
import {SearchConversationUseCase} from "./modules/chat/application/conversation/search_conversations_use_case";
import {SearchUsersUseCase} from "./modules/users/application/search_users_use_case";
import {SearchUsersTxService} from "./modules/users/transactional_services/search_users_tx_service";
import {
    SearchConversationsService
} from "./modules/chat/transactional_services/conversation/search_conversations_service";
import {SearchConversationsController} from "./modules/chat/controllers/conversation/search_conversations_controller";
import {SearchUsersController} from "./modules/users/controllers/search_users_controller";
import {GetSpecificUserUseCase} from "./modules/users/application/get_specific_user_use_case";
import {GetSpecificUserTxService} from "./modules/users/transactional_services/get_specific_user_tx_service";
import {GetSpecificUserController} from "./modules/users/controllers/get_specific_user_controller";
import {SendVerifEmailShared} from "./modules/users/shared/send_verif_email_shared";
import {ConfirmEmailChangeController} from "./modules/users/controllers/confirm_email_change_controller";
import {
    ConfirmEmailChangeUseCase
} from "./modules/infrasctructure/ports/email_verif_infra/email_verif_service/confirm_email_change_use_case";
import {
    ResendVerificationService
} from "./modules/infrasctructure/ports/email_verif_infra/email_sender/resend_verification_service";
import {
    ResendRegisterVerificationController
} from "./modules/users/controllers/resend_register_verification_controller";
import {
    ResendChangeEmailVerificationController
} from "./modules/users/controllers/resend_change_email_verification_controller";

export const RedisCacheService = new CacheService(redisClient);

export function assembleContainer()
{





    // TODO : TRANSACTION MANAGER
    const txManager = new TransactionManager(pool);

    // TODO : USERS REPOSITORIES
    const userRepoReaderPG = new UserRepoReaderPg(pool);
    const userRepoWriterPG = new UserRepoWriterPg(pool);

    // TODO : SHARED FOR USER
    const userMapper = new UserMapper();
    const userLookup = new UserLookup(userRepoReaderPG);
    const extractUserId = new ExtractUserIdFromReq();

    // TODO : INFRA
    const bcrypter = new Bcrypter();

    const refreshTokenRepoPG = new RefreshTokenRepoPg(pool);

    const emailSender = new EmailSenderNodemailer();
    const emailVerificationTokenRepoPG = new EmailVerificationTokenRepoPg(pool);
    const emailVerificationUseCase = new EmailVerificationUseCase(emailVerificationTokenRepoPG, userRepoWriterPG);

    const jwtTokenService = new TokenServiceJWT();

    const sendEmailVerifShared = new SendVerifEmailShared(emailSender, emailVerificationTokenRepoPG);

    // TODO : USER USE CASES
    const changeEmailUseCase = new ChangeEmailUseCase(userRepoReaderPG, userRepoWriterPG, userMapper, userLookup, sendEmailVerifShared);
    const changePasswordUseCase = new ChangePasswordUseCase(userRepoReaderPG, userRepoWriterPG, bcrypter, userMapper, userLookup);
    const changeUsernameUseCase = new ChangeUsernameUseCase(userRepoReaderPG, userRepoWriterPG, userMapper, userLookup);
    const loginEmailUseCase = new LoginEmailUseCase(userRepoReaderPG, bcrypter, userMapper);
    const loginUsernameUseCase = new LoginUsernameUseCase(userRepoReaderPG, bcrypter, userMapper);
    const registerUseCase = new RegisterUseCase(userRepoReaderPG, userRepoWriterPG, bcrypter, userMapper, sendEmailVerifShared);
    const toggleStatusUseCase = new ToggleIsActiveUseCase(userRepoWriterPG, userMapper, userLookup);
    const getSelfProfileUseCase = new GetSelfProfileUseCase(userLookup);
    const searchUsersUseCase = new SearchUsersUseCase(userRepoReaderPG, userLookup, userMapper, RedisCacheService);
    const getSpecificUserUseCase = new GetSpecificUserUseCase(userLookup, userMapper);
    const confirmEmailChangeUseCase = new ConfirmEmailChangeUseCase(emailVerificationTokenRepoPG, userRepoWriterPG);

    // TODO : USER SERVICES
    const changeEmailService = new ChangeEmailTxService(txManager);
    const changePasswordService = new ChangePasswordTxService(txManager);
    const changeUsernameService = new ChangeUsernameTxService(txManager);
    const toggleStatusService = new ToggleStatusTxService(txManager);
    const getSelfProfileService = new GetSelfProfileTxService(txManager);
    const searchUsersService = new SearchUsersTxService(txManager);
    const getSpecificUserService = new GetSpecificUserTxService(txManager);

    // TODO : USER CONTROLLERS
    const changeEmailController = new ChangeEmailController(changeEmailService, extractUserId);
    const changePasswordController = new ChangePasswordController(changePasswordService, extractUserId);
    const changeUsernameController = new ChangeUsernameController(changeUsernameService, extractUserId);
    const toggleStatusController = new ToggleStatusController(toggleStatusService, extractUserId);
    const getSelfProfileController = new GetSelfProfileController(getSelfProfileService, extractUserId);
    const searchUsersController = new SearchUsersController(searchUsersService, extractUserId);
    const getSpecificUserController = new GetSpecificUserController(getSpecificUserService, extractUserId);
    const confirmEmailChangeController = new ConfirmEmailChangeController(confirmEmailChangeUseCase);


    // TODO : AUTHENTIFICATION
    const authService = new AuthService(refreshTokenRepoPG, jwtTokenService, txManager);

    const loginEmailController = new LoginEmailController(authService);
    const loginUsernameController = new LoginUsernameController(authService);
    const logoutController = new LogoutController(authService);
    const refreshController = new RefreshController(authService);
    const registerController = new RegisterController(authService);
    const verifyEmailController = new VerifyEmailController(authService);


    const resendVerificationService = new ResendVerificationService(
        userRepoReaderPG,
        sendEmailVerifShared,
        emailVerificationTokenRepoPG
    );

    const resendVerificationRegisterController = new ResendRegisterVerificationController(
        resendVerificationService
    );
    const resendVerificationChangeEmailController = new ResendChangeEmailVerificationController(
        resendVerificationService,
        extractUserId
    );


    // TODO : CHAT
    const conversationRepo = new ConversationRepositoryPg(pool);
    const messageRepo = new MessageRepositoryPg(pool);
    const participantRepo = new ParticipantRepositoryPg(pool);

    // TODO : SHARED FOR CHAT
    const conversationMapper = new MapToConversationDto();
    const messageMapper = new MapToMessage();
    const participantMapper = new MapToParticipantDto();
    const checkIsParticipant = new CheckIsParticipant(participantRepo);
    const findMessageById = new FindMessageById(messageRepo);


    // TODO : CHAT (USE CASES)
    const createDirectConversationUseCase = new CreateDirectConversationUseCase(
        conversationRepo,
        participantRepo,
        conversationMapper,
        RedisCacheService
    );
    const createGroupConversationUseCase = new CreateGroupConversationUseCase(
        conversationRepo,
        participantRepo,
        conversationMapper,
        RedisCacheService
    );
    const getUserConversationsUseCase = new GetUserConversationsUseCase(
        conversationRepo,
        conversationMapper,
        RedisCacheService
    );
    const markConversationReadUseCase = new MarkConversationReadUseCase(
        conversationRepo,
        participantRepo,
    );
    const updateConversationTitleUseCase = new UpdateConversationTitleUseCase(
        conversationRepo,
        checkIsParticipant,
        conversationMapper,
        RedisCacheService,
        participantRepo
    );
    const searchConversationsUseCase = new SearchConversationUseCase(
        conversationRepo,
        userLookup,
        conversationMapper,
        RedisCacheService,
    )
    // ____ //
    const deleteMessageUseCase = new DeleteMessageUseCase(
        messageRepo,
        messageMapper,
        checkIsParticipant,
        findMessageById,
        RedisCacheService
    );
    const editMessageUseCase = new EditMessageUseCase(
        messageRepo,
        messageMapper,
        checkIsParticipant,
        findMessageById,
        RedisCacheService,
    );
    const getMessagesUseCase = new GetMessagesUseCase(
        messageRepo,
        messageMapper,
        RedisCacheService,
        participantRepo,
    );
    const sendMessageUseCase = new SendMessageUseCase(
        messageRepo,
        conversationRepo,
        messageMapper,
        checkIsParticipant,
        RedisCacheService,
        participantRepo
    );
    const getSpecificMessageUseCase = new GetSpecificMessageUseCase(
        messageMapper,
        findMessageById,
        participantRepo,
        RedisCacheService,
    );
    // ____ //
    const changeParticipantRoleUseCase = new ChangeParticipantRoleUseCase(
        participantRepo,
        participantMapper,
        RedisCacheService,
    );
    const getParticipantsRoleUseCase = new GetParticipantsUseCase(
        participantRepo,
        participantMapper,
        RedisCacheService,
    );
    const getSpecificParticipantUseCase = new GetSpecificParticipantUseCase(
        participantRepo,
        RedisCacheService
    );
    const joinConversationUseCase = new JoinConversationUseCase(
        conversationRepo,
        participantRepo,
        participantMapper,
        RedisCacheService
    );
    const leaveConversationUseCase = new LeaveConversationUseCase(
        participantRepo,
        RedisCacheService
    );
    const muteParticipantUseCase = new MuteParticipantUseCase(
        participantRepo,
        participantMapper,
        RedisCacheService
    );
    const removeParticipantUseCase = new RemoveParticipantUseCase(
        participantRepo,
        RedisCacheService
    );
    const unmuteParticipantUseCase = new UnmuteParticipantUseCase(
        participantRepo,
        participantMapper,
        RedisCacheService
    );

    // TODO : CHAT (SERVICES)
    const createDirectConversationService = new CreateDirectConversationTxService(txManager);
    const createGroupConversationService = new CreateGroupConversationTxService(txManager);
    const getUserConversationsService = new GetUserConversationsTxService(txManager);
    const markConversationReadService = new MarkConversationReadTxService(txManager);
    const updateConversationTitleService = new UpdateConversationTitleTxService(txManager);
    const searchConversationsService = new SearchConversationsService(txManager);

    // ____ //

    const deleteMessageService = new DeleteMessageTxService(txManager);
    const editMessageService = new EditMessageTxService(txManager);
    const getMessagesService = new GetMessageTxService(txManager);
    const sendMessageService = new SendMessageTxService(txManager);
    const getSpecificMessageService = new GetSpecificMessageService(txManager);

    // ____ //

    const changeParticipantRoleService = new ChangeParticipantRoleTxService(txManager);
    const getParticipantsService = new GetParticipantsTxService(txManager);
    const getSpecificParticipantService = new GetSpecificParticipantService(txManager);
    const joinConversationService = new JoinConversationTxService(txManager);
    const leaveConversationService = new LeaveConversationTxService(txManager);
    const muteParticipantService = new MuteParticipantTxService(txManager);
    const removeParticipantService = new RemoveParticipantTxService(txManager);
    const unmuteParticipantService = new UnmuteParticipantTxService(txManager);


    // TODO : WEB SOCKET CONTROLLERS (MESSAGE)
    const deleteMessageController = new DeleteMessageController(deleteMessageService);
    const editMessageController = new EditMessageController(editMessageService);
    const readMessageController = new MarkConversationAsReadController(markConversationReadService);
    const sendMessageController = new SendMessageController(sendMessageService);

    // TODO : CONTROLLERS (TYPING)
    const startTypingController = new StartTypingController();
    const stopTypingController = new StopTypingController();

    // TODO : SHARED FOR CONTROLLERS
    const extractActorId = new ExtractActorId();


    // TODO : HTTP CONTROLLERS
    const createDirectConversationController = new CreateDirectConversationController(
        createDirectConversationService,
        extractActorId
    );
    const createGroupConversationController = new CreateGroupConversationController(
        createGroupConversationService,
        extractActorId
    );
    const getUserConversationController = new GetUserConversationController(
        getUserConversationsService,
        extractActorId
    );
    const updateConversationTitleController = new UpdateConversationTitleController(
        updateConversationTitleService,
        extractActorId
    );
    const searchConversationsController = new SearchConversationsController(
        searchConversationsService,
        extractActorId
    )

    const getMessagesController = new GetMessagesController(
        getMessagesService,
        extractActorId
    );
    const getSpecificMessageController = new GetSpecificMessageController(
        getSpecificMessageService,
        extractActorId
    );

    const changeParticipantRoleController = new ChangeParticipantRoleController(
        changeParticipantRoleService,
        extractActorId
    );
    const getParticipantsController = new GetParticipantsController(
        getParticipantsService,
        extractActorId
    );
    const getSpecificParticipantController = new GetSpecificParticipantController(
        getSpecificParticipantService,
        extractActorId
    )
    const joinConversationController = new JoinConversationController(
        joinConversationService,
        extractActorId
    );
    const leaveConversationController = new LeaveConversationController(
        leaveConversationService,
        extractActorId
    );
    const muteParticipantController = new MuteParticipantController(
        muteParticipantService,
        extractActorId
    );
    const removeParticipantController = new RemoveParticipantController(
        removeParticipantService,
        extractActorId
    );
    const unmuteParticipantController = new UnmuteParticipantController(
        unmuteParticipantService,
        extractActorId
    );




    return {
        resendVerificationRegisterController,
        resendVerificationChangeEmailController,

        // user
        changeEmailController,
        changePasswordController,
        changeUsernameController,
        toggleStatusController,
        getSelfProfileController,
        searchUsersController,
        getSpecificUserController,
        confirmEmailChangeController,

        // jwt token service
        jwtTokenService,

        // auth
        loginEmailController,
        loginUsernameController,
        logoutController,
        refreshController,
        registerController,
        verifyEmailController,

        // services for web socket
        sendMessageService,
        editMessageService,
        deleteMessageService,
        getUserConversationsService,
        markConversationReadService,

        // controllers for web socket
        sendMessageController,
        editMessageController,
        deleteMessageController,
        readMessageController,

        startTypingController,
        stopTypingController,

        // HTTP Controllers
        createDirectConversationController,
        createGroupConversationController,
        getUserConversationController,
        updateConversationTitleController,
        searchConversationsController,

        getMessagesController,
        getSpecificMessageController,

        changeParticipantRoleController,
        getParticipantsController,
        joinConversationController,
        leaveConversationController,
        muteParticipantController,
        removeParticipantController,
        unmuteParticipantController,
        getSpecificParticipantController
    }
}

export type AppContainer = ReturnType<typeof assembleContainer>;