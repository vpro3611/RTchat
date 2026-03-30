"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendChangeEmailVerificationController = void 0;
class ResendChangeEmailVerificationController {
    resendVerificationService;
    extractUserIdFromReq;
    constructor(resendVerificationService, extractUserIdFromReq) {
        this.resendVerificationService = resendVerificationService;
        this.extractUserIdFromReq = extractUserIdFromReq;
    }
    resendChangeEmailVerificationCont = async (req, res) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);
        await this.resendVerificationService.resendChangeEmail(userId);
        return res.status(200).json({ ok: true });
    };
}
exports.ResendChangeEmailVerificationController = ResendChangeEmailVerificationController;
