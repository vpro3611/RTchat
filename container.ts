import {TransactionManager} from "./src/modules/infrasctructure/ports/transaction_manager/transaction_manager";
import {pool} from "./src/database";
import {UserRepoReaderPg} from "./src/modules/users/repositories/user_repo_reader_pg";
import {UserRepoWriterPg} from "./src/modules/users/repositories/user_repo_writer_pg";
import {
    EmailVerificationTokenRepoPg
} from "./src/modules/infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg";
import {RefreshTokenRepoPg} from "./src/modules/authentification/refresh_token_repo/refresh_token_repo_pg";
import {ChangeEmailUseCase} from "./src/modules/users/application/change_email_use_case";
import {UserMapper} from "./src/modules/users/shared/map_to_dto";
import {UserLookup} from "./src/modules/users/shared/user_exists_by_id";
import {ChangePasswordUseCase} from "./src/modules/users/application/change_password_use_case";
import {Bcrypter} from "./src/modules/infrasctructure/ports/bcrypter/bcrypter";
import {ChangeUsernameUseCase} from "./src/modules/users/application/change_username_use_case";
import {LoginEmailUseCase} from "./src/modules/users/application/login_email_use_case";
import {LoginUsernameUseCase} from "./src/modules/users/application/login_username_use_case";
import {RegisterUseCase} from "./src/modules/users/application/register_use_case";
import {EmailSenderNodemailer} from "./src/modules/infrasctructure/ports/email_verif_infra/email_sender/email_sender";
import {ToggleIsActiveUseCase} from "./src/modules/users/application/toggle_status_use_case";
import {ChangeEmailTxService} from "./src/modules/users/transactional_services/change_email_tx_service";
import {ChangePasswordTxService} from "./src/modules/users/transactional_services/change_password_tx_service";
import {ChangeUsernameTxService} from "./src/modules/users/transactional_services/change_username_tx_service";
import {ToggleStatusTxService} from "./src/modules/users/transactional_services/toggle_status_tx_service";
import {
    EmailVerificationUseCase
} from "./src/modules/infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case";
import {AuthService} from "./src/modules/authentification/auth_service";
import {TokenServiceJWT} from "./src/modules/authentification/jwt_token_service/token_service";
import {LoginEmailController} from "./src/modules/authentification/controllers/login_email_controller";
import {LoginUsernameController} from "./src/modules/authentification/controllers/login_username_controller";
import {LogoutController} from "./src/modules/authentification/controllers/logout_controller";
import {RefreshController} from "./src/modules/authentification/controllers/refresh_controller";
import {RegisterController} from "./src/modules/authentification/controllers/register_controller";
import {VerifyEmailController} from "./src/modules/authentification/controllers/verify_email_controller";
import {ChangeEmailController} from "./src/modules/users/controllers/change_email_controller";
import {ExtractUserIdFromReq} from "./src/modules/users/shared/extract_user_id_from_req";
import {ChangePasswordController} from "./src/modules/users/controllers/change_password_controller";
import {ChangeUsernameController} from "./src/modules/users/controllers/change_username_controller";
import {ToggleStatusController} from "./src/modules/users/controllers/toggle_status_controller";


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


    // TODO : USER USE CASES
    const changeEmailUseCase = new ChangeEmailUseCase(userRepoReaderPG, userRepoWriterPG, userMapper, userLookup);
    const changePasswordUseCase = new ChangePasswordUseCase(userRepoReaderPG, userRepoWriterPG, bcrypter, userMapper, userLookup);
    const changeUsernameUseCase = new ChangeUsernameUseCase(userRepoReaderPG, userRepoWriterPG, userMapper, userLookup);
    const loginEmailUseCase = new LoginEmailUseCase(userRepoReaderPG, bcrypter, userMapper);
    const loginUsernameUseCase = new LoginUsernameUseCase(userRepoReaderPG, bcrypter, userMapper);
    const registerUseCase = new RegisterUseCase(userRepoReaderPG, userRepoWriterPG, bcrypter, emailSender, emailVerificationTokenRepoPG, userMapper);
    const toggleStatusUseCase = new ToggleIsActiveUseCase(userRepoWriterPG, userMapper, userLookup);

    // TODO : USER SERVICES
    const changeEmailService = new ChangeEmailTxService(txManager);
    const changePasswordService = new ChangePasswordTxService(txManager);
    const changeUsernameService = new ChangeUsernameTxService(txManager);
    const toggleStatusService = new ToggleStatusTxService(txManager);

    // TODO : USER CONTROLLERS
    const changeEmailController = new ChangeEmailController(changeEmailService, extractUserId);
    const changePasswordController = new ChangePasswordController(changePasswordService, extractUserId);
    const changeUsernameController = new ChangeUsernameController(changeUsernameService, extractUserId);
    const toggleStatusController = new ToggleStatusController(toggleStatusService, extractUserId);

    // TODO : AUTHENTIFICATION
    const authService = new AuthService(refreshTokenRepoPG, jwtTokenService, txManager);

    const loginEmailController = new LoginEmailController(authService);
    const loginUsernameController = new LoginUsernameController(authService);
    const logoutController = new LogoutController(authService);
    const refreshController = new RefreshController(authService);
    const registerController = new RegisterController(authService);
    const verifyEmailController = new VerifyEmailController(authService);

    return {
        // user
        changeEmailController,
        changePasswordController,
        changeUsernameController,
        toggleStatusController,

        // auth
        loginEmailController,
        loginUsernameController,
        logoutController,
        refreshController,
        registerController,
        verifyEmailController,
    }
}

export type AppContainer = ReturnType<typeof assembleContainer>;