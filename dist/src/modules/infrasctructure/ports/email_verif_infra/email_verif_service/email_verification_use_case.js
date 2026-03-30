"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationUseCase = void 0;
const crypto = __importStar(require("node:crypto"));
const token_errors_1 = require("../errors/token_errors");
class EmailVerificationUseCase {
    verificationRepo;
    userRepoWriter;
    constructor(verificationRepo, userRepoWriter) {
        this.verificationRepo = verificationRepo;
        this.userRepoWriter = userRepoWriter;
    }
    async getRecord(tokenHash) {
        const record = await this.verificationRepo.findByTokenHash(tokenHash);
        if (!record) {
            throw new token_errors_1.InvalidTokenError('Invalid or expired token');
        }
        return record;
    }
    async execute(rawToken) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const record = await this.getRecord(tokenHash);
        await this.userRepoWriter.markAsVerified(record.userId);
        await this.verificationRepo.deleteByUserId(record.userId);
    }
}
exports.EmailVerificationUseCase = EmailVerificationUseCase;
