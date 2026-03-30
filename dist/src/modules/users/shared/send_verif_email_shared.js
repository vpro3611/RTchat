"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendVerifEmailShared = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
class SendVerifEmailShared {
    emailSender;
    emailVerificationRepo;
    constructor(emailSender, emailVerificationRepo) {
        this.emailSender = emailSender;
        this.emailVerificationRepo = emailVerificationRepo;
    }
    createToken() {
        return node_crypto_1.default.randomBytes(32).toString('hex');
    }
    createTokenHash(rawToken) {
        return node_crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
    }
    async saveToRepo(tokenHash, saved) {
        await this.emailVerificationRepo.saveToken({
            id: node_crypto_1.default.randomUUID(),
            userId: saved.id,
            tokenHash: tokenHash,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });
    }
    async sendIt(email, saved, path, flowType) {
        const rawToken = this.createToken();
        const tokenHash = this.createTokenHash(rawToken);
        await this.saveToRepo(tokenHash, saved);
        await this.emailSender.sendVerificationEmail(email, rawToken, path, flowType);
    }
}
exports.SendVerifEmailShared = SendVerifEmailShared;
