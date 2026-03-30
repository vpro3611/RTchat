"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockSpecificUserController = exports.UnblockSpecificUserParamsSchema = void 0;
const zod_1 = require("zod");
exports.UnblockSpecificUserParamsSchema = zod_1.z.object({
    targetId: zod_1.z.string(),
});
class UnblockSpecificUserController {
    unblockSpecificUserService;
    extractUserId;
    constructor(unblockSpecificUserService, extractUserId) {
        this.unblockSpecificUserService = unblockSpecificUserService;
        this.extractUserId = extractUserId;
    }
    unblockSpecificUserCont = async (req, res) => {
        const userId = this.extractUserId.extractUserId(req);
        const { targetId } = req.params;
        const result = await this.unblockSpecificUserService.unblockSpecificUserTxService(userId, targetId);
        return res.status(200).json(result);
    };
}
exports.UnblockSpecificUserController = UnblockSpecificUserController;
