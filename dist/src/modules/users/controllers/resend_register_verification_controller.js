"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendRegisterVerificationController = exports.ResendRegisterVerificationBodySchema = void 0;
const zod_1 = require("zod");
exports.ResendRegisterVerificationBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
class ResendRegisterVerificationController {
    resendVerificationService;
    constructor(resendVerificationService) {
        this.resendVerificationService = resendVerificationService;
    }
    resendRegisterVerificationCont = async (req, res) => {
        const { email } = req.body;
        await this.resendVerificationService.resendRegister(email);
        return res.status(200).json({ ok: true });
    };
}
exports.ResendRegisterVerificationController = ResendRegisterVerificationController;
