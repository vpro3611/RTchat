"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const js_sha256_1 = require("js-sha256");
const user_repo_reader_pg_1 = require("../users/repositories/user_repo_reader_pg");
const user_repo_writer_pg_1 = require("../users/repositories/user_repo_writer_pg");
const bcrypter_1 = require("../infrasctructure/ports/bcrypter/bcrypter");
const email_sender_1 = require("../infrasctructure/ports/email_verif_infra/email_sender/email_sender");
const email_verification_token_repo_pg_1 = require("../infrasctructure/ports/email_verif_infra/email_verification_token_repo/email_verification_token_repo_pg");
const map_to_dto_1 = require("../users/shared/map_to_dto");
const register_use_case_1 = require("../users/application/register_use_case");
const refresh_token_repo_pg_1 = require("./refresh_token_repo/refresh_token_repo_pg");
const login_username_use_case_1 = require("../users/application/login_username_use_case");
const login_email_use_case_1 = require("../users/application/login_email_use_case");
const email_verification_use_case_1 = require("../infrasctructure/ports/email_verif_infra/email_verif_service/email_verification_use_case");
const token_errors_1 = require("./errors/token_errors");
const send_verif_email_shared_1 = require("../users/shared/send_verif_email_shared");
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
class AuthService {
    tokenRepo;
    jwtService;
    txManager;
    constructor(tokenRepo, jwtService, txManager) {
        this.tokenRepo = tokenRepo;
        this.jwtService = jwtService;
        this.txManager = txManager;
    }
    async generateTokens(userId, repo) {
        const accessToken = this.jwtService.generateAccessToken(userId);
        const refreshToken = this.jwtService.generateRefreshToken(userId);
        const hashedRefreshToken = (0, js_sha256_1.sha256)(refreshToken);
        await repo.create({
            id: crypto.randomUUID(),
            userId: userId,
            tokenHash: hashedRefreshToken,
            expiresAt: new Date(Date.now() + ONE_WEEK) // 1 WEEK === 7 DAYS === 7 * 24 * 60 * 60 * 1000
        });
        return {
            accessToken,
            refreshToken
        };
    }
    async refresh(refreshToken) {
        return this.txManager.runInTransaction(async (client) => {
            const refreshRepo = new refresh_token_repo_pg_1.RefreshTokenRepoPg(client);
            const payload = this.jwtService.verifyRefreshToken(refreshToken);
            const hashed = (0, js_sha256_1.sha256)(refreshToken);
            const existingToken = await refreshRepo.findValidByHash(hashed);
            if (!existingToken) {
                throw new token_errors_1.InvalidTokenJWTError("Invalid refresh token");
            }
            if (existingToken.expiresAt < new Date()) {
                throw new token_errors_1.TokenExpiredError("Refresh token expired");
            }
            await refreshRepo.revoke(existingToken.id);
            return this.generateTokens(payload.sub, refreshRepo);
        });
    }
    async register(username, email, password) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const userRepoWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const bcrypter = new bcrypter_1.Bcrypter();
            const emailSender = new email_sender_1.EmailSenderNodemailer();
            const emailVerifRepo = new email_verification_token_repo_pg_1.EmailVerificationTokenRepoPg(client);
            const mapper = new map_to_dto_1.UserMapper();
            const sendVerifEmailShared = new send_verif_email_shared_1.SendVerifEmailShared(emailSender, emailVerifRepo);
            const registerUseCase = new register_use_case_1.RegisterUseCase(userRepoReader, userRepoWriter, bcrypter, mapper, sendVerifEmailShared);
            const user = await registerUseCase.registerUseCase(username, email, password);
            return { user };
        });
    }
    async loginByUsername(username, password) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const bcrypter = new bcrypter_1.Bcrypter();
            const mapper = new map_to_dto_1.UserMapper();
            const refreshTokenRepo = new refresh_token_repo_pg_1.RefreshTokenRepoPg(client);
            const loginByUsernameUseCase = new login_username_use_case_1.LoginUsernameUseCase(userRepoReader, bcrypter, mapper);
            const user = await loginByUsernameUseCase.loginByUsernameUseCase(username, password);
            const tokens = await this.generateTokens(user.id, refreshTokenRepo);
            return { user, ...tokens };
        });
    }
    async loginByEmail(email, password) {
        return this.txManager.runInTransaction(async (client) => {
            const userRepoReader = new user_repo_reader_pg_1.UserRepoReaderPg(client);
            const bcrypter = new bcrypter_1.Bcrypter();
            const mapper = new map_to_dto_1.UserMapper();
            const refreshTokenRepo = new refresh_token_repo_pg_1.RefreshTokenRepoPg(client);
            const loginByEmailUseCase = new login_email_use_case_1.LoginEmailUseCase(userRepoReader, bcrypter, mapper);
            const user = await loginByEmailUseCase.loginByEmailUseCase(email, password);
            const tokens = await this.generateTokens(user.id, refreshTokenRepo);
            return { user, ...tokens };
        });
    }
    async logout(refreshToken) {
        return this.txManager.runInTransaction(async (client) => {
            const refreshRepo = new refresh_token_repo_pg_1.RefreshTokenRepoPg(client);
            const hashed = (0, js_sha256_1.sha256)(refreshToken);
            await refreshRepo.revokeByHash(hashed);
        });
    }
    async verifyEmail(token) {
        return this.txManager.runInTransaction(async (client) => {
            const emailVerifRepo = new email_verification_token_repo_pg_1.EmailVerificationTokenRepoPg(client);
            const userRepoWriter = new user_repo_writer_pg_1.UserRepoWriterPg(client);
            const verificationUseCase = new email_verification_use_case_1.EmailVerificationUseCase(emailVerifRepo, userRepoWriter);
            await verificationUseCase.execute(token);
        });
    }
}
exports.AuthService = AuthService;
