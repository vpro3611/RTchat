"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordController = exports.ChangePasswordBodySchema = void 0;
const zod_1 = require("zod");
exports.ChangePasswordBodySchema = zod_1.z.object({
    oldPassword: zod_1.z.string(),
    newPassword: zod_1.z.string(),
});
class ChangePasswordController {
    changePasswordService;
    extractUserId;
    constructor(changePasswordService, extractUserId) {
        this.changePasswordService = changePasswordService;
        this.extractUserId = extractUserId;
    }
    changePasswordController = async (req, res) => {
        const userId = this.extractUserId.extractUserId(req);
        const { oldPassword, newPassword } = req.body;
        const result = await this.changePasswordService.changePasswordTxService(userId, oldPassword, newPassword);
        return res.status(200).json(result);
    };
}
exports.ChangePasswordController = ChangePasswordController;
