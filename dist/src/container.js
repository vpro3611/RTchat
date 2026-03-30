"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
exports.assembleContainer = assembleContainer;
const transaction_manager_1 = require("./modules/infrasctructure/ports/transaction_manager/transaction_manager");
const database_1 = require("./database");
const user_repo_reader_pg_1 = require("./modules/users/repositories/user_repo_reader_pg");
const user_repo_writer_pg_1 = require("./modules/users/repositories/user_repo_writer_pg");
const email_verification_token_repo_pg_1 = require("./modules/infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg");
const refresh_token_repo_pg_1 = require("./modules/authentification/refresh_token_repo/refresh_token_repo_pg");
const change_email_use_case_1 = require("./modules/users/application/change_email_use_case");
const map_to_dto_1 = require("./modules/users/shared/map_to_dto");
const user_exists_by_id_1 = require("./modules/users/shared/user_exists_by_id");
const change_password_use_case_1 = require("./modules/users/application/change_password_use_case");
const bcrypter_1 = require("./modules/infrasctructure/ports/bcrypter/bcrypter");
const change_username_use_case_1 = require("./modules/users/application/change_username_use_case");
const login_email_use_case_1 = require("./modules/users/application/login_email_use_case");
const login_username_use_case_1 = require("./modules/users/application/login_username_use_case");
const register_use_case_1 = require("./modules/users/application/register_use_case");
const email_sender_1 = require("./modules/infrasctructure/ports/email_verif_infra/email_sender/email_sender");
const toggle_status_use_case_1 = require("./modules/users/application/toggle_status_use_case");
const change_email_tx_service_1 = require("./modules/users/transactional_services/change_email_tx_service");
const change_password_tx_service_1 = require("./modules/users/transactional_services/change_password_tx_service");
const change_username_tx_service_1 = require("./modules/users/transactional_services/change_username_tx_service");
const toggle_status_tx_service_1 = require("./modules/users/transactional_services/toggle_status_tx_service");
const email_verification_use_case_1 = require("./modules/infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case");
const auth_service_1 = require("./modules/authentification/auth_service");
const token_service_1 = require("./modules/authentification/jwt_token_service/token_service");
const login_email_controller_1 = require("./modules/authentification/controllers/login_email_controller");
const login_username_controller_1 = require("./modules/authentification/controllers/login_username_controller");
const logout_controller_1 = require("./modules/authentification/controllers/logout_controller");
const refresh_controller_1 = require("./modules/authentification/controllers/refresh_controller");
const register_controller_1 = require("./modules/authentification/controllers/register_controller");
const verify_email_controller_1 = require("./modules/authentification/controllers/verify_email_controller");
const change_email_controller_1 = require("./modules/users/controllers/change_email_controller");
const extract_user_id_from_req_1 = require("./modules/users/shared/extract_user_id_from_req");
const change_password_controller_1 = require("./modules/users/controllers/change_password_controller");
const change_username_controller_1 = require("./modules/users/controllers/change_username_controller");
const toggle_status_controller_1 = require("./modules/users/controllers/toggle_status_controller");
const cache_service_1 = require("./modules/infrasctructure/ports/cache_service/cache_service");
const reddis_client_1 = require("./modules/infrasctructure/ports/cache_service/reddis_client");
const conversation_repository_pg_1 = require("./modules/chat/repositories_pg_realization/conversation_repository_pg");
const message_repository_pg_1 = require("./modules/chat/repositories_pg_realization/message_repository_pg");
const participant_repository_pg_1 = require("./modules/chat/repositories_pg_realization/participant_repository_pg");
const create_direct_conversation_use_case_1 = require("./modules/chat/application/conversation/create_direct_conversation_use_case");
const map_to_conversation_dto_1 = require("./modules/chat/shared/map_to_conversation_dto");
const create_group_conversation_use_case_1 = require("./modules/chat/application/conversation/create_group_conversation_use_case");
const get_user_conversations_use_case_1 = require("./modules/chat/application/conversation/get_user_conversations_use_case");
const mark_conversation_read_use_case_1 = require("./modules/chat/application/conversation/mark_conversation_read_use_case");
const update_conversation_title_use_case_1 = require("./modules/chat/application/conversation/update_conversation_title_use_case");
const is_participant_1 = require("./modules/chat/shared/is_participant");
const delete_message_use_case_1 = require("./modules/chat/application/message/delete_message_use_case");
const map_to_message_1 = require("./modules/chat/shared/map_to_message");
const find_message_by_id_1 = require("./modules/chat/shared/find_message_by_id");
const edit_message_use_case_1 = require("./modules/chat/application/message/edit_message_use_case");
const get_messages_use_case_1 = require("./modules/chat/application/message/get_messages_use_case");
const send_message_use_case_1 = require("./modules/chat/application/message/send_message_use_case");
const change_participant_role_use_case_1 = require("./modules/chat/application/participant/change_participant_role_use_case");
const map_to_participant_dto_1 = require("./modules/chat/shared/map_to_participant_dto");
const get_participants_use_case_1 = require("./modules/chat/application/participant/get_participants_use_case");
const join_conversation_use_case_1 = require("./modules/chat/application/participant/join_conversation_use_case");
const leave_conversation_use_case_1 = require("./modules/chat/application/participant/leave_conversation_use_case");
const mute_participant_use_case_1 = require("./modules/chat/application/participant/mute_participant_use_case");
const remove_participant_use_case_1 = require("./modules/chat/application/participant/remove_participant_use_case");
const unmute_participant_use_case_1 = require("./modules/chat/application/participant/unmute_participant_use_case");
const create_direct_conversation_service_1 = require("./modules/chat/transactional_services/conversation/create_direct_conversation_service");
const get_user_conversations_service_1 = require("./modules/chat/transactional_services/conversation/get_user_conversations_service");
const create_group_conversation_service_1 = require("./modules/chat/transactional_services/conversation/create_group_conversation_service");
const mark_conversation_read_service_1 = require("./modules/chat/transactional_services/conversation/mark_conversation_read_service");
const update_conversation_title_service_1 = require("./modules/chat/transactional_services/conversation/update_conversation_title_service");
const delete_message_service_1 = require("./modules/chat/transactional_services/message/delete_message_service");
const edit_message_service_1 = require("./modules/chat/transactional_services/message/edit_message_service");
const get_messages_service_1 = require("./modules/chat/transactional_services/message/get_messages_service");
const send_message_service_1 = require("./modules/chat/transactional_services/message/send_message_service");
const change_participant_role_service_1 = require("./modules/chat/transactional_services/participant/change_participant_role_service");
const get_participants_service_1 = require("./modules/chat/transactional_services/participant/get_participants_service");
const join_conversation_service_1 = require("./modules/chat/transactional_services/participant/join_conversation_service");
const leave_conversation_service_1 = require("./modules/chat/transactional_services/participant/leave_conversation_service");
const mute_participant_service_1 = require("./modules/chat/transactional_services/participant/mute_participant_service");
const unmute_participant_service_1 = require("./modules/chat/transactional_services/participant/unmute_participant_service");
const remove_participant_service_1 = require("./modules/chat/transactional_services/participant/remove_participant_service");
const delete_message_controller_1 = require("./modules/chat/web_socket_controllers/message_controllers/delete_message_controller");
const edit_message_controller_1 = require("./modules/chat/web_socket_controllers/message_controllers/edit_message_controller");
const send_message_controller_1 = require("./modules/chat/web_socket_controllers/message_controllers/send_message_controller");
const read_message_controller_1 = require("./modules/chat/web_socket_controllers/message_controllers/read_message_controller");
const start_typing_controller_1 = require("./modules/chat/web_socket_controllers/typing_controllers/start_typing_controller");
const stop_typing_controller_1 = require("./modules/chat/web_socket_controllers/typing_controllers/stop_typing_controller");
const extract_actor_id_req_1 = require("./modules/chat/shared/extract_actor_id_req");
const create_direct_conversation_controller_1 = require("./modules/chat/controllers/conversation/create_direct_conversation_controller");
const create_group_conversation_controller_1 = require("./modules/chat/controllers/conversation/create_group_conversation_controller");
const join_conversation_controller_1 = require("./modules/chat/controllers/participant/join_conversation_controller");
const get_user_conversation_controller_1 = require("./modules/chat/controllers/conversation/get_user_conversation_controller");
const update_conversation_title_controller_1 = require("./modules/chat/controllers/conversation/update_conversation_title_controller");
const get_messages_controller_1 = require("./modules/chat/controllers/message/get_messages_controller");
const change_participant_role_controller_1 = require("./modules/chat/controllers/participant/change_participant_role_controller");
const leave_conversation_controller_1 = require("./modules/chat/controllers/participant/leave_conversation_controller");
const mute_participant_controller_1 = require("./modules/chat/controllers/participant/mute_participant_controller");
const remove_participant_controller_1 = require("./modules/chat/controllers/participant/remove_participant_controller");
const unmute_participant_controller_1 = require("./modules/chat/controllers/participant/unmute_participant_controller");
const get_participants_controller_1 = require("./modules/chat/controllers/participant/get_participants_controller");
const get_specific_participant_use_case_1 = require("./modules/chat/application/participant/get_specific_participant_use_case");
const get_specific_participant_service_1 = require("./modules/chat/transactional_services/participant/get_specific_participant_service");
const get_specific_participant_controller_1 = require("./modules/chat/controllers/participant/get_specific_participant_controller");
const get_specific_message_use_case_1 = require("./modules/chat/application/message/get_specific_message_use_case");
const get_specific_message_service_1 = require("./modules/chat/transactional_services/message/get_specific_message_service");
const get_specific_message_controller_1 = require("./modules/chat/controllers/message/get_specific_message_controller");
const get_self_profile_use_case_1 = require("./modules/users/application/get_self_profile_use_case");
const get_self_profile_tx_service_1 = require("./modules/users/transactional_services/get_self_profile_tx_service");
const get_self_profile_controller_1 = require("./modules/users/controllers/get_self_profile_controller");
const search_conversations_use_case_1 = require("./modules/chat/application/conversation/search_conversations_use_case");
const search_users_use_case_1 = require("./modules/users/application/search_users_use_case");
const search_users_tx_service_1 = require("./modules/users/transactional_services/search_users_tx_service");
const search_conversations_service_1 = require("./modules/chat/transactional_services/conversation/search_conversations_service");
const search_conversations_controller_1 = require("./modules/chat/controllers/conversation/search_conversations_controller");
const search_users_controller_1 = require("./modules/users/controllers/search_users_controller");
const get_specific_user_use_case_1 = require("./modules/users/application/get_specific_user_use_case");
const get_specific_user_tx_service_1 = require("./modules/users/transactional_services/get_specific_user_tx_service");
const get_specific_user_controller_1 = require("./modules/users/controllers/get_specific_user_controller");
const send_verif_email_shared_1 = require("./modules/users/shared/send_verif_email_shared");
const confirm_email_change_controller_1 = require("./modules/users/controllers/confirm_email_change_controller");
const confirm_email_change_use_case_1 = require("./modules/infrasctructure/ports/email_verif_infra/email_verif_service/confirm_email_change_use_case");
const resend_verification_service_1 = require("./modules/infrasctructure/ports/email_verif_infra/email_sender/resend_verification_service");
const resend_register_verification_controller_1 = require("./modules/users/controllers/resend_register_verification_controller");
const resend_change_email_verification_controller_1 = require("./modules/users/controllers/resend_change_email_verification_controller");
const user_to_user_blocks_pg_1 = require("./modules/users/repositories/user_to_user_blocks_pg");
const block_specific_user_use_case_1 = require("./modules/users/application/block_specific_user_use_case");
const unblock_specific_user_use_case_1 = require("./modules/users/application/unblock_specific_user_use_case");
const block_specific_user_tx_service_1 = require("./modules/users/transactional_services/block_specific_user_tx_service");
const unblock_specific_user_tx_service_1 = require("./modules/users/transactional_services/unblock_specific_user_tx_service");
const block_specific_user_controller_1 = require("./modules/users/controllers/block_specific_user_controller");
const unblock_specific_user_controller_1 = require("./modules/users/controllers/unblock_specific_user_controller");
const get_full_black_list_use_case_1 = require("./modules/users/application/get_full_black_list_use_case");
const get_full_black_list_tx_service_1 = require("./modules/users/transactional_services/get_full_black_list_tx_service");
const get_full_black_list_controller_1 = require("./modules/users/controllers/get_full_black_list_controller");
const conversation_bans_repository_pg_1 = require("./modules/chat/repositories_pg_realization/conversation_bans_repository_pg");
const ban_group_participant_use_case_1 = require("./modules/chat/application/participant/ban_group_participant_use_case");
const unban_group_participant_use_case_1 = require("./modules/chat/application/participant/unban_group_participant_use_case");
const get_banned_users_use_case_1 = require("./modules/chat/application/participant/get_banned_users_use_case");
const ban_group_participant_service_1 = require("./modules/chat/transactional_services/participant/ban_group_participant_service");
const unban_group_participant_service_1 = require("./modules/chat/transactional_services/participant/unban_group_participant_service");
const get_banned_users_service_1 = require("./modules/chat/transactional_services/participant/get_banned_users_service");
const ban_group_participant_controller_1 = require("./modules/chat/controllers/participant/ban_group_participant_controller");
const unban_group_participant_controller_1 = require("./modules/chat/controllers/participant/unban_group_participant_controller");
const get_banned_users_controller_1 = require("./modules/chat/controllers/participant/get_banned_users_controller");
const conversation_requests_repository_pg_1 = require("./modules/chat/repositories_pg_realization/conversation_requests_repository_pg");
const map_to_request_dto_1 = require("./modules/chat/shared/map_to_request_dto");
const change_request_status_use_case_1 = require("./modules/chat/application/conversation_requests/change_request_status_use_case");
const withdraw_request_use_case_1 = require("./modules/chat/application/conversation_requests/withdraw_request_use_case");
const create_conversation_request_use_case_1 = require("./modules/chat/application/conversation_requests/create_conversation_request_use_case");
const change_request_status_service_1 = require("./modules/chat/transactional_services/conversation_requests/change_request_status_service");
const withdraw_request_service_1 = require("./modules/chat/transactional_services/conversation_requests/withdraw_request_service");
const cretate_conversation_reques_service_1 = require("./modules/chat/transactional_services/conversation_requests/cretate_conversation_reques_service");
const change_conversation_request_status_controller_1 = require("./modules/chat/controllers/conversation_requests/change_conversation_request_status_controller");
const withdraw_conversation_request_controller_1 = require("./modules/chat/controllers/conversation_requests/withdraw_conversation_request_controller");
const create_conversation_request_controller_1 = require("./modules/chat/controllers/conversation_requests/create_conversation_request_controller");
const get_all_requst_list_use_case_1 = require("./modules/chat/application/conversation_requests/get_all_requst_list_use_case");
const get_all_request_list_service_1 = require("./modules/chat/transactional_services/conversation_requests/get_all_request_list_service");
const get_all_request_list_controller_1 = require("./modules/chat/controllers/conversation_requests/get_all_request_list_controller");
const get_users_requests_use_case_1 = require("./modules/chat/application/conversation_requests/get_users_requests_use_case");
const remove_request_use_case_1 = require("./modules/chat/application/conversation_requests/remove_request_use_case");
const get_users_requests_service_1 = require("./modules/chat/transactional_services/conversation_requests/get_users_requests_service");
const remove_request_service_1 = require("./modules/chat/transactional_services/conversation_requests/remove_request_service");
const get_users_request_controller_1 = require("./modules/chat/controllers/conversation_requests/get_users_request_controller");
const remove_request_controller_1 = require("./modules/chat/controllers/conversation_requests/remove_request_controller");
const get_specific_request_user_use_case_1 = require("./modules/chat/application/conversation_requests/get_specific_request_user_use_case");
const get_specific_request_group_use_case_1 = require("./modules/chat/application/conversation_requests/get_specific_request_group_use_case");
const get_specific_request_user_service_1 = require("./modules/chat/transactional_services/conversation_requests/get_specific_request_user_service");
const get_specific_request_group_service_1 = require("./modules/chat/transactional_services/conversation_requests/get_specific_request_group_service");
const get_specific_request_user_controller_1 = require("./modules/chat/controllers/conversation_requests/get_specific_request_user_controller");
const get_specific_request_group_controller_1 = require("./modules/chat/controllers/conversation_requests/get_specific_request_group_controller");
const add_participant_to_conversation_use_case_1 = require("./modules/chat/application/participant/add_participant_to_conversation_use_case");
const add_participant_to_conversation_tx_service_1 = require("./modules/chat/transactional_services/participant/add_participant_to_conversation_tx_service");
const add_participant_to_a_conversation_controller_1 = require("./modules/chat/controllers/participant/add_participant_to_a_conversation_controller");
const get_saved_messages_list_use_case_1 = require("./modules/chat/application/saved_messages/get_saved_messages_list_use_case");
const saved_messages_repo_pg_1 = require("./modules/chat/repositories_pg_realization/saved_messages_repo_pg");
const map_to_saved_message_dto_1 = require("./modules/chat/shared/map_to_saved_message_dto");
const get_specific_saved_message_use_case_1 = require("./modules/chat/application/saved_messages/get_specific_saved_message_use_case");
const remove_saved_message_use_case_1 = require("./modules/chat/application/saved_messages/remove_saved_message_use_case");
const save_message_use_case_1 = require("./modules/chat/application/saved_messages/save_message_use_case");
const get_saved_messages_list_service_1 = require("./modules/chat/transactional_services/saved_messages/get_saved_messages_list_service");
const get_specific_saved_message_service_1 = require("./modules/chat/transactional_services/saved_messages/get_specific_saved_message_service");
const remove_saved_message_service_1 = require("./modules/chat/transactional_services/saved_messages/remove_saved_message_service");
const save_message_service_1 = require("./modules/chat/transactional_services/saved_messages/save_message_service");
const get_saved_messages_list_controller_1 = require("./modules/chat/controllers/saved_messages/get_saved_messages_list_controller");
const get_specific_saved_message_controller_1 = require("./modules/chat/controllers/saved_messages/get_specific_saved_message_controller");
const remove_saved_message_controller_1 = require("./modules/chat/controllers/saved_messages/remove_saved_message_controller");
const save_message_controller_1 = require("./modules/chat/controllers/saved_messages/save_message_controller");
const avatar_repository_pg_1 = require("./modules/chat/repositories_pg_realization/avatar_repository_pg");
const get_avatar_use_case_1 = require("./modules/chat/application/avatar/get_avatar_use_case");
const get_avatar_controller_1 = require("./modules/chat/controllers/avatar/get_avatar_controller");
const set_user_avatar_tx_service_1 = require("./modules/chat/transactional_services/avatar/set_user_avatar_tx_service");
const delete_user_avatar_tx_service_1 = require("./modules/chat/transactional_services/avatar/delete_user_avatar_tx_service");
const set_user_avatar_controller_1 = require("./modules/chat/controllers/avatar/set_user_avatar_controller");
const delete_user_avatar_controller_1 = require("./modules/chat/controllers/avatar/delete_user_avatar_controller");
const set_conversation_avatar_tx_service_1 = require("./modules/chat/transactional_services/avatar/set_conversation_avatar_tx_service");
const delete_conversation_avatar_tx_service_1 = require("./modules/chat/transactional_services/avatar/delete_conversation_avatar_tx_service");
const set_conversation_avatar_controller_1 = require("./modules/chat/controllers/avatar/set_conversation_avatar_controller");
const delete_conversation_avatar_controller_1 = require("./modules/chat/controllers/avatar/delete_conversation_avatar_controller");
exports.RedisCacheService = new cache_service_1.CacheService(reddis_client_1.redisClient);
function assembleContainer() {
    // TODO : TRANSACTION MANAGER
    const txManager = new transaction_manager_1.TransactionManager(database_1.pool);
    // TODO : USERS REPOSITORIES
    const userRepoReaderPG = new user_repo_reader_pg_1.UserRepoReaderPg(database_1.pool);
    const userRepoWriterPG = new user_repo_writer_pg_1.UserRepoWriterPg(database_1.pool);
    const userToUserBlocksPG = new user_to_user_blocks_pg_1.UserToUserBlocksPg(database_1.pool);
    // TODO : SHARED FOR USER
    const userMapper = new map_to_dto_1.UserMapper();
    const userLookup = new user_exists_by_id_1.UserLookup(userRepoReaderPG);
    const extractUserId = new extract_user_id_from_req_1.ExtractUserIdFromReq();
    // TODO : INFRA
    const bcrypter = new bcrypter_1.Bcrypter();
    const refreshTokenRepoPG = new refresh_token_repo_pg_1.RefreshTokenRepoPg(database_1.pool);
    const emailSender = new email_sender_1.EmailSenderNodemailer();
    const emailVerificationTokenRepoPG = new email_verification_token_repo_pg_1.EmailVerificationTokenRepoPg(database_1.pool);
    const emailVerificationUseCase = new email_verification_use_case_1.EmailVerificationUseCase(emailVerificationTokenRepoPG, userRepoWriterPG);
    const jwtTokenService = new token_service_1.TokenServiceJWT();
    const sendEmailVerifShared = new send_verif_email_shared_1.SendVerifEmailShared(emailSender, emailVerificationTokenRepoPG);
    // TODO : USER USE CASES
    const changeEmailUseCase = new change_email_use_case_1.ChangeEmailUseCase(userRepoReaderPG, userRepoWriterPG, userMapper, userLookup, sendEmailVerifShared);
    const changePasswordUseCase = new change_password_use_case_1.ChangePasswordUseCase(userRepoReaderPG, userRepoWriterPG, bcrypter, userMapper, userLookup);
    const changeUsernameUseCase = new change_username_use_case_1.ChangeUsernameUseCase(userRepoReaderPG, userRepoWriterPG, userMapper, userLookup);
    const loginEmailUseCase = new login_email_use_case_1.LoginEmailUseCase(userRepoReaderPG, bcrypter, userMapper);
    const loginUsernameUseCase = new login_username_use_case_1.LoginUsernameUseCase(userRepoReaderPG, bcrypter, userMapper);
    const registerUseCase = new register_use_case_1.RegisterUseCase(userRepoReaderPG, userRepoWriterPG, bcrypter, userMapper, sendEmailVerifShared);
    const toggleStatusUseCase = new toggle_status_use_case_1.ToggleIsActiveUseCase(userRepoWriterPG, userMapper, userLookup);
    const getSelfProfileUseCase = new get_self_profile_use_case_1.GetSelfProfileUseCase(userLookup);
    const searchUsersUseCase = new search_users_use_case_1.SearchUsersUseCase(userRepoReaderPG, userLookup, userMapper, exports.RedisCacheService);
    const getSpecificUserUseCase = new get_specific_user_use_case_1.GetSpecificUserUseCase(userLookup, userMapper);
    const confirmEmailChangeUseCase = new confirm_email_change_use_case_1.ConfirmEmailChangeUseCase(emailVerificationTokenRepoPG, userRepoWriterPG);
    const blockSpecificUserUseCase = new block_specific_user_use_case_1.BlockSpecificUserUseCase(userToUserBlocksPG, userRepoReaderPG, userMapper);
    const unblockSpecificUserUseCase = new unblock_specific_user_use_case_1.UnblockSpecificUserUseCase(userToUserBlocksPG, userRepoReaderPG, userMapper);
    const getFullBlackListUseCase = new get_full_black_list_use_case_1.GetFullBlackListUseCase(userToUserBlocksPG, userLookup, userMapper);
    // TODO : USER SERVICES
    const changeEmailService = new change_email_tx_service_1.ChangeEmailTxService(txManager);
    const changePasswordService = new change_password_tx_service_1.ChangePasswordTxService(txManager);
    const changeUsernameService = new change_username_tx_service_1.ChangeUsernameTxService(txManager);
    const toggleStatusService = new toggle_status_tx_service_1.ToggleStatusTxService(txManager);
    const getSelfProfileService = new get_self_profile_tx_service_1.GetSelfProfileTxService(txManager);
    const searchUsersService = new search_users_tx_service_1.SearchUsersTxService(txManager);
    const getSpecificUserService = new get_specific_user_tx_service_1.GetSpecificUserTxService(txManager);
    const blockSpecificUserService = new block_specific_user_tx_service_1.BlockSpecificUserTxService(txManager);
    const unblockSpecificUserService = new unblock_specific_user_tx_service_1.UnblockSpecificUserTxService(txManager);
    const getFullBlackListService = new get_full_black_list_tx_service_1.GetFullBlackListTxService(txManager);
    // TODO : USER CONTROLLERS
    const changeEmailController = new change_email_controller_1.ChangeEmailController(changeEmailService, extractUserId);
    const changePasswordController = new change_password_controller_1.ChangePasswordController(changePasswordService, extractUserId);
    const changeUsernameController = new change_username_controller_1.ChangeUsernameController(changeUsernameService, extractUserId);
    const toggleStatusController = new toggle_status_controller_1.ToggleStatusController(toggleStatusService, extractUserId);
    const getSelfProfileController = new get_self_profile_controller_1.GetSelfProfileController(getSelfProfileService, extractUserId);
    const searchUsersController = new search_users_controller_1.SearchUsersController(searchUsersService, extractUserId);
    const getSpecificUserController = new get_specific_user_controller_1.GetSpecificUserController(getSpecificUserService, extractUserId);
    const confirmEmailChangeController = new confirm_email_change_controller_1.ConfirmEmailChangeController(confirmEmailChangeUseCase);
    const blockSpecificUserController = new block_specific_user_controller_1.BlockSpecificUserController(blockSpecificUserService, extractUserId);
    const unblockSpecificUserController = new unblock_specific_user_controller_1.UnblockSpecificUserController(unblockSpecificUserService, extractUserId);
    const getFullBlackListController = new get_full_black_list_controller_1.GetFullBlackListController(getFullBlackListService, extractUserId);
    // TODO : AUTHENTIFICATION
    const authService = new auth_service_1.AuthService(refreshTokenRepoPG, jwtTokenService, txManager);
    const loginEmailController = new login_email_controller_1.LoginEmailController(authService);
    const loginUsernameController = new login_username_controller_1.LoginUsernameController(authService);
    const logoutController = new logout_controller_1.LogoutController(authService);
    const refreshController = new refresh_controller_1.RefreshController(authService);
    const registerController = new register_controller_1.RegisterController(authService);
    const verifyEmailController = new verify_email_controller_1.VerifyEmailController(authService);
    const resendVerificationService = new resend_verification_service_1.ResendVerificationService(userRepoReaderPG, sendEmailVerifShared, emailVerificationTokenRepoPG);
    const resendVerificationRegisterController = new resend_register_verification_controller_1.ResendRegisterVerificationController(resendVerificationService);
    const resendVerificationChangeEmailController = new resend_change_email_verification_controller_1.ResendChangeEmailVerificationController(resendVerificationService, extractUserId);
    // TODO : CHAT
    const conversationRepo = new conversation_repository_pg_1.ConversationRepositoryPg(database_1.pool);
    const messageRepo = new message_repository_pg_1.MessageRepositoryPg(database_1.pool);
    const participantRepo = new participant_repository_pg_1.ParticipantRepositoryPg(database_1.pool);
    const conversationBansRepo = new conversation_bans_repository_pg_1.ConversationBansRepositoryPg(database_1.pool);
    const conversationRequestsRepo = new conversation_requests_repository_pg_1.ConversationRequestsRepositoryPg(database_1.pool);
    const savedMessageRepo = new saved_messages_repo_pg_1.SavedMessagesRepoPg(database_1.pool);
    const avatarRepo = new avatar_repository_pg_1.AvatarRepositoryPg(database_1.pool);
    // TODO : SHARED FOR CHAT
    const conversationMapper = new map_to_conversation_dto_1.MapToConversationDto();
    const messageMapper = new map_to_message_1.MapToMessage();
    const participantMapper = new map_to_participant_dto_1.MapToParticipantDto();
    const checkIsParticipant = new is_participant_1.CheckIsParticipant(participantRepo);
    const findMessageById = new find_message_by_id_1.FindMessageById(messageRepo);
    const mapToRequestDto = new map_to_request_dto_1.MapToRequestDto();
    const mapToSavedMessageDto = new map_to_saved_message_dto_1.MapToSavedMessageDto();
    // TODO : CHAT (USE CASES)
    const createDirectConversationUseCase = new create_direct_conversation_use_case_1.CreateDirectConversationUseCase(conversationRepo, participantRepo, conversationMapper, exports.RedisCacheService, userToUserBlocksPG);
    const createGroupConversationUseCase = new create_group_conversation_use_case_1.CreateGroupConversationUseCase(conversationRepo, participantRepo, conversationMapper, exports.RedisCacheService);
    const getUserConversationsUseCase = new get_user_conversations_use_case_1.GetUserConversationsUseCase(conversationRepo, conversationMapper, exports.RedisCacheService);
    const markConversationReadUseCase = new mark_conversation_read_use_case_1.MarkConversationReadUseCase(conversationRepo, participantRepo);
    const updateConversationTitleUseCase = new update_conversation_title_use_case_1.UpdateConversationTitleUseCase(conversationRepo, checkIsParticipant, conversationMapper, exports.RedisCacheService, participantRepo);
    const searchConversationsUseCase = new search_conversations_use_case_1.SearchConversationUseCase(conversationRepo, userLookup, conversationMapper, exports.RedisCacheService);
    // ____ //
    const deleteMessageUseCase = new delete_message_use_case_1.DeleteMessageUseCase(messageRepo, messageMapper, checkIsParticipant, findMessageById, exports.RedisCacheService);
    const editMessageUseCase = new edit_message_use_case_1.EditMessageUseCase(messageRepo, messageMapper, checkIsParticipant, findMessageById, exports.RedisCacheService);
    const getMessagesUseCase = new get_messages_use_case_1.GetMessagesUseCase(messageRepo, messageMapper, exports.RedisCacheService, participantRepo);
    const sendMessageUseCase = new send_message_use_case_1.SendMessageUseCase(messageRepo, conversationRepo, messageMapper, checkIsParticipant, exports.RedisCacheService, participantRepo, userToUserBlocksPG, conversationBansRepo);
    const getSpecificMessageUseCase = new get_specific_message_use_case_1.GetSpecificMessageUseCase(messageMapper, findMessageById, participantRepo, exports.RedisCacheService);
    // ____ //
    const changeParticipantRoleUseCase = new change_participant_role_use_case_1.ChangeParticipantRoleUseCase(participantRepo, participantMapper, exports.RedisCacheService);
    const getParticipantsRoleUseCase = new get_participants_use_case_1.GetParticipantsUseCase(participantRepo, exports.RedisCacheService);
    const getSpecificParticipantUseCase = new get_specific_participant_use_case_1.GetSpecificParticipantUseCase(participantRepo, exports.RedisCacheService);
    const joinConversationUseCase = new join_conversation_use_case_1.JoinConversationUseCase(conversationRepo, participantRepo, exports.RedisCacheService, conversationBansRepo, conversationRequestsRepo, mapToRequestDto);
    const leaveConversationUseCase = new leave_conversation_use_case_1.LeaveConversationUseCase(participantRepo, exports.RedisCacheService);
    const muteParticipantUseCase = new mute_participant_use_case_1.MuteParticipantUseCase(participantRepo, participantMapper, exports.RedisCacheService);
    const removeParticipantUseCase = new remove_participant_use_case_1.RemoveParticipantUseCase(participantRepo, exports.RedisCacheService);
    const unmuteParticipantUseCase = new unmute_participant_use_case_1.UnmuteParticipantUseCase(participantRepo, participantMapper, exports.RedisCacheService);
    const banConversationParticipantUseCase = new ban_group_participant_use_case_1.BanGroupParticipantUseCase(participantRepo, conversationBansRepo, exports.RedisCacheService);
    const unbanConversationParticipantUseCase = new unban_group_participant_use_case_1.UnbanGroupParticipantUseCase(participantRepo, conversationBansRepo, exports.RedisCacheService);
    const getBannedParticipantsUseCase = new get_banned_users_use_case_1.GetBannedUsersUseCase(participantRepo, conversationBansRepo, exports.RedisCacheService);
    const addParticipantToConversationUseCase = new add_participant_to_conversation_use_case_1.AddParticipantToConversationUseCase(userRepoReaderPG, participantRepo, conversationBansRepo, participantMapper, conversationRepo, userToUserBlocksPG, exports.RedisCacheService);
    // ____ //
    const changeRequestStatusUseCase = new change_request_status_use_case_1.ChangeRequestStatusUseCase(participantRepo, conversationRequestsRepo, mapToRequestDto, exports.RedisCacheService);
    const withdrawRequestUseCase = new withdraw_request_use_case_1.WithdrawRequestUseCase(userRepoReaderPG, conversationRequestsRepo, mapToRequestDto, exports.RedisCacheService);
    const createConversationRequestUseCase = new create_conversation_request_use_case_1.CreateConversationRequestUseCase(userRepoReaderPG, participantRepo, conversationRepo, conversationBansRepo, conversationRequestsRepo, mapToRequestDto, exports.RedisCacheService);
    const getAllRequestsUseCase = new get_all_requst_list_use_case_1.GetAllRequestListUseCase(participantRepo, conversationRequestsRepo, mapToRequestDto, exports.RedisCacheService);
    const getAllUsersRequestUseCase = new get_users_requests_use_case_1.GetUsersRequestsUseCase(userRepoReaderPG, conversationRequestsRepo, mapToRequestDto, exports.RedisCacheService);
    const removeSpecificRequestUseCase = new remove_request_use_case_1.RemoveRequestUseCase(userRepoReaderPG, conversationRequestsRepo, exports.RedisCacheService);
    const getSpecificRequestUserUseCase = new get_specific_request_user_use_case_1.GetSpecificRequestUserUseCase(conversationRequestsRepo, userRepoReaderPG, mapToRequestDto, exports.RedisCacheService);
    const getSpecificRequestConversationUseCase = new get_specific_request_group_use_case_1.GetSpecificRequestGroupUseCase(participantRepo, conversationRequestsRepo, mapToRequestDto, exports.RedisCacheService);
    // ____ //
    const getSavedMessagesListUseCase = new get_saved_messages_list_use_case_1.GetSavedMessagesListUseCase(userRepoReaderPG, savedMessageRepo, mapToSavedMessageDto, exports.RedisCacheService);
    const getSpecificSavedMessageUseCase = new get_specific_saved_message_use_case_1.GetSpecificSavedMessageUseCase(userRepoReaderPG, savedMessageRepo, mapToSavedMessageDto, exports.RedisCacheService);
    const removeSavedMessageUseCase = new remove_saved_message_use_case_1.RemoveSavedMessageUseCase(userRepoReaderPG, savedMessageRepo, exports.RedisCacheService);
    const saveMessageUseCase = new save_message_use_case_1.SaveMessageUseCase(participantRepo, savedMessageRepo, messageRepo, mapToSavedMessageDto, exports.RedisCacheService);
    const getAvatarUseCase = new get_avatar_use_case_1.GetAvatarUseCase(avatarRepo);
    // TODO : CHAT (SERVICES)
    const createDirectConversationService = new create_direct_conversation_service_1.CreateDirectConversationTxService(txManager);
    const createGroupConversationService = new create_group_conversation_service_1.CreateGroupConversationTxService(txManager);
    const getUserConversationsService = new get_user_conversations_service_1.GetUserConversationsTxService(txManager);
    const markConversationReadService = new mark_conversation_read_service_1.MarkConversationReadTxService(txManager);
    const updateConversationTitleService = new update_conversation_title_service_1.UpdateConversationTitleTxService(txManager);
    const searchConversationsService = new search_conversations_service_1.SearchConversationsService(txManager);
    // ____ //
    const deleteMessageService = new delete_message_service_1.DeleteMessageTxService(txManager);
    const editMessageService = new edit_message_service_1.EditMessageTxService(txManager);
    const getMessagesService = new get_messages_service_1.GetMessageTxService(txManager);
    const sendMessageService = new send_message_service_1.SendMessageTxService(txManager);
    const getSpecificMessageService = new get_specific_message_service_1.GetSpecificMessageService(txManager);
    // ____ //
    const changeParticipantRoleService = new change_participant_role_service_1.ChangeParticipantRoleTxService(txManager);
    const getParticipantsService = new get_participants_service_1.GetParticipantsTxService(txManager);
    const getSpecificParticipantService = new get_specific_participant_service_1.GetSpecificParticipantService(txManager);
    const joinConversationService = new join_conversation_service_1.JoinConversationTxService(txManager);
    const leaveConversationService = new leave_conversation_service_1.LeaveConversationTxService(txManager);
    const muteParticipantService = new mute_participant_service_1.MuteParticipantTxService(txManager);
    const removeParticipantService = new remove_participant_service_1.RemoveParticipantTxService(txManager);
    const unmuteParticipantService = new unmute_participant_service_1.UnmuteParticipantTxService(txManager);
    const banParticipantService = new ban_group_participant_service_1.BanGroupParticipantService(txManager);
    const unbanParticipantService = new unban_group_participant_service_1.UnbanGroupParticipantService(txManager);
    const getBannedUsersService = new get_banned_users_service_1.GetBannedUsersService(txManager);
    const addParticipantToConversationService = new add_participant_to_conversation_tx_service_1.AddParticipantToConversationTxService(txManager);
    // ____ //
    const changeRequestStatusService = new change_request_status_service_1.ChangeRequestStatusService(txManager);
    const withdrawRequestService = new withdraw_request_service_1.WithdrawRequestService(txManager);
    const createConversationRequestService = new cretate_conversation_reques_service_1.CreateConversationRequestService(txManager);
    const getAllRequestsService = new get_all_request_list_service_1.GetAllRequestListService(txManager);
    const getAllUsersRequestService = new get_users_requests_service_1.GetUsersRequestsService(txManager);
    const removeSpecificRequestService = new remove_request_service_1.RemoveRequestService(txManager);
    const getSpecificRequestUserService = new get_specific_request_user_service_1.GetSpecificRequestUserService(txManager);
    const getSpecificRequestConversationService = new get_specific_request_group_service_1.GetSpecificRequestGroupService(txManager);
    // ____ //
    const getSavedMessagesListService = new get_saved_messages_list_service_1.GetSavedMessagesListService(txManager);
    const getSpecificSavedMessageService = new get_specific_saved_message_service_1.GetSpecificSavedMessageService(txManager);
    const removeSavedMessageService = new remove_saved_message_service_1.RemoveSavedMessageService(txManager);
    const saveMessageService = new save_message_service_1.SaveMessageService(txManager);
    const setUserAvatarService = new set_user_avatar_tx_service_1.SetUserAvatarTxService(txManager);
    const deleteUserAvatarService = new delete_user_avatar_tx_service_1.DeleteUserAvatarTxService(txManager);
    const setConversationAvatarService = new set_conversation_avatar_tx_service_1.SetConversationAvatarTxService(txManager);
    const deleteConversationAvatarService = new delete_conversation_avatar_tx_service_1.DeleteConversationAvatarTxService(txManager);
    // TODO : WEB SOCKET CONTROLLERS (MESSAGE)
    const deleteMessageController = new delete_message_controller_1.DeleteMessageController(deleteMessageService);
    const editMessageController = new edit_message_controller_1.EditMessageController(editMessageService);
    const readMessageController = new read_message_controller_1.MarkConversationAsReadController(markConversationReadService);
    const sendMessageController = new send_message_controller_1.SendMessageController(sendMessageService);
    // TODO : CONTROLLERS (TYPING)
    const startTypingController = new start_typing_controller_1.StartTypingController();
    const stopTypingController = new stop_typing_controller_1.StopTypingController();
    // TODO : SHARED FOR CONTROLLERS
    const extractActorId = new extract_actor_id_req_1.ExtractActorId();
    // TODO : HTTP CONTROLLERS
    const createDirectConversationController = new create_direct_conversation_controller_1.CreateDirectConversationController(createDirectConversationService, extractActorId);
    const createGroupConversationController = new create_group_conversation_controller_1.CreateGroupConversationController(createGroupConversationService, extractActorId);
    const getUserConversationController = new get_user_conversation_controller_1.GetUserConversationController(getUserConversationsService, extractActorId);
    const updateConversationTitleController = new update_conversation_title_controller_1.UpdateConversationTitleController(updateConversationTitleService, extractActorId);
    const searchConversationsController = new search_conversations_controller_1.SearchConversationsController(searchConversationsService, extractActorId);
    const getMessagesController = new get_messages_controller_1.GetMessagesController(getMessagesService, extractActorId);
    const getSpecificMessageController = new get_specific_message_controller_1.GetSpecificMessageController(getSpecificMessageService, extractActorId);
    const changeParticipantRoleController = new change_participant_role_controller_1.ChangeParticipantRoleController(changeParticipantRoleService, extractActorId);
    const getParticipantsController = new get_participants_controller_1.GetParticipantsController(getParticipantsService, extractActorId);
    const getSpecificParticipantController = new get_specific_participant_controller_1.GetSpecificParticipantController(getSpecificParticipantService, extractActorId);
    const joinConversationController = new join_conversation_controller_1.JoinConversationController(joinConversationService, extractActorId);
    const leaveConversationController = new leave_conversation_controller_1.LeaveConversationController(leaveConversationService, extractActorId);
    const muteParticipantController = new mute_participant_controller_1.MuteParticipantController(muteParticipantService, extractActorId);
    const removeParticipantController = new remove_participant_controller_1.RemoveParticipantController(removeParticipantService, extractActorId);
    const unmuteParticipantController = new unmute_participant_controller_1.UnmuteParticipantController(unmuteParticipantService, extractActorId);
    const banParticipantController = new ban_group_participant_controller_1.BanGroupParticipantController(banParticipantService, extractActorId);
    const unbanParticipantController = new unban_group_participant_controller_1.UnbanGroupParticipantController(unbanParticipantService, extractActorId);
    const getBannedUsersController = new get_banned_users_controller_1.GetBannedUsersController(getBannedUsersService, extractActorId);
    const addParticipantToConversationController = new add_participant_to_a_conversation_controller_1.AddParticipantToAConversationController(addParticipantToConversationService, extractActorId);
    // ____ //
    const changeConversationRequestStatusController = new change_conversation_request_status_controller_1.ChangeConversationRequestStatusController(changeRequestStatusService, extractActorId);
    const withdrawConversationRequestController = new withdraw_conversation_request_controller_1.WithdrawConversationRequestController(withdrawRequestService, extractActorId);
    const createConversationRequestController = new create_conversation_request_controller_1.CreateConversationRequestController(createConversationRequestService, extractActorId);
    const getAllConversationRequestsController = new get_all_request_list_controller_1.GetAllRequestListController(getAllRequestsService, extractActorId);
    const getUsersRequestsController = new get_users_request_controller_1.GetUsersRequestController(getAllUsersRequestService, extractActorId);
    const removeConversationRequestController = new remove_request_controller_1.RemoveRequestController(removeSpecificRequestService, extractActorId);
    const getSpecificRequestUserController = new get_specific_request_user_controller_1.GetSpecificRequestUserController(getSpecificRequestUserService, extractActorId);
    const getSpecificRequestGroupController = new get_specific_request_group_controller_1.GetSpecificRequestGroupController(getSpecificRequestConversationService, extractActorId);
    // ____ //
    const getSavedMessagesListController = new get_saved_messages_list_controller_1.GetSavedMessagesListController(getSavedMessagesListService, extractActorId);
    const getSpecificSavedMessageController = new get_specific_saved_message_controller_1.GetSpecificSavedMessageController(getSpecificSavedMessageService, extractActorId);
    const removeSavedMessageController = new remove_saved_message_controller_1.RemoveSavedMessageController(removeSavedMessageService, extractActorId);
    const saveMessageController = new save_message_controller_1.SaveMessageController(saveMessageService, extractActorId);
    const getAvatarController = new get_avatar_controller_1.GetAvatarController(getAvatarUseCase);
    const setUserAvatarController = new set_user_avatar_controller_1.SetUserAvatarController(setUserAvatarService, extractActorId);
    const deleteUserAvatarController = new delete_user_avatar_controller_1.DeleteUserAvatarController(deleteUserAvatarService, extractActorId);
    const setConversationAvatarController = new set_conversation_avatar_controller_1.SetConversationAvatarController(setConversationAvatarService, extractActorId);
    const deleteConversationAvatarController = new delete_conversation_avatar_controller_1.DeleteConversationAvatarController(deleteConversationAvatarService, extractActorId);
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
        blockSpecificUserController,
        unblockSpecificUserController,
        getFullBlackListController,
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
        getSpecificParticipantController,
        banParticipantController,
        unbanParticipantController,
        getBannedUsersController,
        addParticipantToConversationController,
        changeConversationRequestStatusController,
        withdrawConversationRequestController,
        createConversationRequestController,
        getAllConversationRequestsController,
        getUsersRequestsController,
        removeConversationRequestController,
        getSpecificRequestUserController,
        getSpecificRequestGroupController,
        getSavedMessagesListController,
        getSpecificSavedMessageController,
        removeSavedMessageController,
        saveMessageController,
        getAvatarController,
        setUserAvatarController,
        deleteUserAvatarController,
        setConversationAvatarController,
        deleteConversationAvatarController,
    };
}
