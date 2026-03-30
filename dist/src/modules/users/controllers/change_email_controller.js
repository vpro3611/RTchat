"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeEmailController = exports.ChangeEmailBodySchema = void 0;
const zod_1 = require("zod");
exports.ChangeEmailBodySchema = zod_1.z.object({
    newEmail: zod_1.z.string().email(),
});
class ChangeEmailController {
    changeEmailService;
    extractUserId;
    constructor(changeEmailService, extractUserId) {
        this.changeEmailService = changeEmailService;
        this.extractUserId = extractUserId;
    }
    changeEmailController = async (req, res) => {
        const userId = this.extractUserId.extractUserId(req);
        const { newEmail } = req.body;
        const result = await this.changeEmailService.changeEmailTxService(userId, newEmail);
        return res.status(200).json(result);
    };
}
exports.ChangeEmailController = ChangeEmailController;
