"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockSpecificUserController = exports.BlockSpecificUserParamsSchema = void 0;
const zod_1 = require("zod");
exports.BlockSpecificUserParamsSchema = zod_1.z.object({
    targetId: zod_1.z.string(),
});
class BlockSpecificUserController {
    blockSpecificUserService;
    extractUserId;
    constructor(blockSpecificUserService, extractUserId) {
        this.blockSpecificUserService = blockSpecificUserService;
        this.extractUserId = extractUserId;
    }
    blockSpecificUserCont = async (req, res) => {
        const userId = this.extractUserId.extractUserId(req);
        const { targetId } = req.params;
        const result = await this.blockSpecificUserService.blockSpecificUserTxService(userId, targetId);
        return res.status(200).json(result);
    };
}
exports.BlockSpecificUserController = BlockSpecificUserController;
