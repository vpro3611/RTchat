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

            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            const hashed = sha256(refreshToken);

            const existingToken = await refreshRepo.findValidByHash(hashed);

            if (!existingToken) {
                throw new InvalidTokenJWTError("Invalid refresh token");
            }

            if (existingToken.expiresAt < new Date()) {
                throw new TokenExpiredError("Refresh token expired");
            }

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
                sendVerifEmailShared
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

