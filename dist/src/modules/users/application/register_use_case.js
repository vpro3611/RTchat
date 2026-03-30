"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const Username_1 = require("../domain/Username");
const email_1 = require("../domain/email");
const user_1 = require("../domain/user");
const password_1 = require("../domain/password");
const username_errors_1 = require("../errors/username_errors");
const email_errors_1 = require("../errors/email_errors");
class RegisterUseCase {
    userRepoReader;
    userRepoWriter;
    bcrypter;
    mapper;
    sendVerifEmailShared;
    constructor(userRepoReader, userRepoWriter, bcrypter, mapper, sendVerifEmailShared) {
        this.userRepoReader = userRepoReader;
        this.userRepoWriter = userRepoWriter;
        this.bcrypter = bcrypter;
        this.mapper = mapper;
        this.sendVerifEmailShared = sendVerifEmailShared;
    }
    async checkForUsername(username) {
        const usernameDetect = await this.userRepoReader.getUserByUsername(username);
        if (usernameDetect) {
            throw new username_errors_1.UsernameAlreadyExistsError(`Username: ${username} already exists`);
        }
    }
    async checkForEmail(email) {
        const emailDetect = await this.userRepoReader.getUserByEmail(email);
        if (emailDetect) {
            throw new email_errors_1.EmailAlreadyExistsError(`Email: ${email} already exists`);
        }
    }
    async registerUseCase(username, email, password) {
        const usernameValid = Username_1.Username.create(username);
        const emailValid = email_1.Email.create(email);
        const passwordValid = password_1.Password.validatePlain(password);
        await this.checkForUsername(usernameValid.getValue());
        await this.checkForEmail(emailValid.getValue());
        const passwordHash = await this.bcrypter.hash(passwordValid);
        const user = user_1.User.create(usernameValid, emailValid, password_1.Password.fromHash(passwordHash));
        const saved = await this.userRepoWriter.save(user);
        await this.sendVerifEmailShared.sendIt(emailValid.getValue(), saved, "/public/verify-email", "register");
        // const rawToken = crypto.randomBytes(32).toString('hex');
        //
        // const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        //
        // await this.emailVerificationRepo.saveToken({
        //     id: crypto.randomUUID(),
        //     userId: saved.id,
        //     tokenHash: tokenHash,
        //     createdAt: new Date(),
        //     expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        // })
        //
        // await this.emailSender.sendVerificationEmail(emailValid.getValue(), rawToken);
        return this.mapper.mapToDto(saved);
    }
}
exports.RegisterUseCase = RegisterUseCase;
