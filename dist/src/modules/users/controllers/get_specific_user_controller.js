"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificUserController = exports.GetSpecificUserParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetSpecificUserParamsSchema = zod_1.z.object({
    targetId: zod_1.z.string(),
});
class GetSpecificUserController {
    getSpecificUserService;
    extractUserIdFromReq;
    constructor(getSpecificUserService, extractUserIdFromReq) {
        this.getSpecificUserService = getSpecificUserService;
        this.extractUserIdFromReq = extractUserIdFromReq;
    }
    getSpecificUserController = async (req, res) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);
        const { targetId } = req.params;
        const result = await this.getSpecificUserService.getSpecificUserTxService(userId, targetId);
        return res.status(200).json(result);
    };
}
exports.GetSpecificUserController = GetSpecificUserController;
