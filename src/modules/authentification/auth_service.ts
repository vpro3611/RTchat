import {RefreshTokenRepoInterface} from "./ports/refresh_token_repo_interface";
import {TokenServiceInterface} from "./ports/token_service_interface";
import {TransactionManagerInterface} from "../infrasctructure/ports/transaction_manager/transaction_manager_interface";
import {sha256} from "js-sha256";
import {UserRepoReaderPg} from "../users/repositories/user_repo_reader_pg";
import {UserRepoWriterPg} from "../users/repositories/user_repo_writer_pg";
import {Bcrypter} from "../infrasctructure/ports/bcrypter/bcrypter";
import {EmailSenderNodemailer} from "../infrasctructure/ports/email_verif_infra/email_sender/email_sender";
import {
    EmailVerificationTokenRepoPg
} from "../infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg";
import {UserMapper} from "../users/shared/map_to_dto";
import {RegisterUseCase} from "../users/application/register_use_case";
import {RefreshTokenRepoPg} from "./refresh_token_repo/refresh_token_repo_pg";
import {LoginUsernameUseCase} from "../users/application/login_username_use_case";
import {LoginEmailUseCase} from "../users/application/login_email_use_case";
import {
    EmailVerificationUseCase
} from "../infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case";
import {InvalidTokenJWTError, TokenExpiredError} from "./errors/token_errors";
import {SendVerifEmailShared} from "../users/shared/send_verif_email_shared";
import {LoginGoogleUseCase} from "../users/application/login_google_use_case";
import {RegisterGoogleUseCase} from "../users/application/register_google_use_case";
import {GoogleAuthService} from "./google_auth_service/google_auth_service";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

export class AuthService {
    constructor(private readonly tokenRepo: RefreshTokenRepoInterface,
                private readonly jwtService: TokenServiceInterface,
                private readonly txManager: TransactionManagerInterface
    ) {}

    async generateTokens(userId: string, repo: RefreshTokenRepoInterface) {
        const accessToken = this.jwtService.generateAccessToken(userId);
        const refreshToken = this.jwtService.generateRefreshToken(userId);

        const hashedRefreshToken = sha256(refreshToken);

        await repo.create(
            {
                id: crypto.randomUUID(),
                userId: userId,
                tokenHash: hashedRefreshToken,
                expiresAt: new Date(Date.now() + ONE_WEEK) // 1 WEEK === 7 DAYS === 7 * 24 * 60 * 60 * 1000
            }
        );

        return {
            accessToken,
            refreshToken
        }
    }

    async refresh(refreshToken: string) {
        return this.txManager.runInTransaction(async (client) => {
            const refreshRepo = new RefreshTokenRepoPg(client);
            const userRepoReader = new UserRepoReaderPg(client);

            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            const hashed = sha256(refreshToken);

            const existingToken = await refreshRepo.findValidByHash(hashed);

            if (!existingToken) {
                throw new InvalidTokenJWTError("Invalid refresh token");
            }

            if (existingToken.expiresAt < new Date()) {
                throw new TokenExpiredError("Refresh token expired");
            }

            const user = await userRepoReader.getUserById(payload.sub);
            if (!user) {
                throw new InvalidTokenJWTError("User not found");
            }

            user.canLogin();

            await refreshRepo.revoke(existingToken.id);

            return this.generateTokens(payload.sub, refreshRepo);
        })
    }

    async register(username: string, email: string, password: string) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userRepoWriter = new UserRepoWriterPg(client);
            const bcrypter = new Bcrypter();
            const emailSender = new EmailSenderNodemailer();
            const emailVerifRepo = new EmailVerificationTokenRepoPg(client);
            const mapper = new UserMapper();

            const sendVerifEmailShared = new SendVerifEmailShared(emailSender, emailVerifRepo);

            const registerUseCase = new RegisterUseCase(
                userRepoReader,
                userRepoWriter,
                bcrypter,
                mapper,
                sendVerifEmailShared,
                emailVerifRepo
            );

            const user = await registerUseCase.registerUseCase(username, email, password);

            return {user};
        });
    }

    async loginByUsername(username: string, password: string) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const bcrypter = new Bcrypter();
            const mapper = new UserMapper();

            const refreshTokenRepo = new RefreshTokenRepoPg(client);

            const loginByUsernameUseCase = new LoginUsernameUseCase(userRepoReader, bcrypter, mapper);

            const user = await loginByUsernameUseCase.loginByUsernameUseCase(username, password);

            const tokens = await this.generateTokens(user.id, refreshTokenRepo);

            return {user, ...tokens};
        })
    }

    async loginByEmail(email: string, password: string) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const bcrypter = new Bcrypter();
            const mapper = new UserMapper();

            const refreshTokenRepo = new RefreshTokenRepoPg(client);

            const loginByEmailUseCase = new LoginEmailUseCase(userRepoReader, bcrypter, mapper);

            const user = await loginByEmailUseCase.loginByEmailUseCase(email, password);

            const tokens = await this.generateTokens(user.id, refreshTokenRepo);

            return {user, ...tokens};
        });
    }

    async loginByGoogle(idToken: string, clientId: string) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const mapper = new UserMapper();
            const googleAuthService = new GoogleAuthService(clientId);

            const refreshTokenRepo = new RefreshTokenRepoPg(client);

            const loginGoogleUseCase = new LoginGoogleUseCase(userRepoReader, mapper, googleAuthService, this.jwtService);

            const result = await loginGoogleUseCase.loginGoogleUseCase(idToken);

            if (result.registrationToken) {
                return {
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    registrationToken: result.registrationToken,
                    requiresRegistration: true
                };
            }

            const tokens = await this.generateTokens(result.user!.id, refreshTokenRepo);

            return {user: result.user, ...tokens, requiresRegistration: false, registrationToken: null};
        });
    }

    async registerByGoogle(username: string, password: string, registrationToken: string) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new UserRepoReaderPg(client);
            const userRepoWriter = new UserRepoWriterPg(client);
            const bcrypter = new Bcrypter();
            const mapper = new UserMapper();

            const refreshTokenRepo = new RefreshTokenRepoPg(client);

            const registerGoogleUseCase = new RegisterGoogleUseCase(
                userRepoReader,
                userRepoWriter,
                bcrypter,
                mapper,
                this.jwtService
            );

            const user = await registerGoogleUseCase.registerGoogleUseCase(username, password, registrationToken);

            const tokens = await this.generateTokens(user.id, refreshTokenRepo);

            return {user, ...tokens};
        });
    }

    async logout(refreshToken: string) {
        return this.txManager.runInTransaction(async (client) => {
            const refreshRepo = new RefreshTokenRepoPg(client);

            const hashed = sha256(refreshToken);

            await refreshRepo.revokeByHash(hashed);
        })
    }

    async verifyEmail(token: string) {
        return this.txManager.runInTransaction(async (client) => {
            const emailVerifRepo = new EmailVerificationTokenRepoPg(client);
            const userRepoWriter = new UserRepoWriterPg(client);

            const verificationUseCase = new EmailVerificationUseCase(emailVerifRepo, userRepoWriter);

            await verificationUseCase.execute(token);
        })
    }
}

