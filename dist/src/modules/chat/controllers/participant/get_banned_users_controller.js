"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBannedUsersController = exports.GetBannedUsersParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetBannedUsersParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class GetBannedUsersController {
    getBannedUsersService;
    extractActorId;
    constructor(getBannedUsersService, extractActorId) {
        this.getBannedUsersService = getBannedUsersService;
        this.extractActorId = extractActorId;
    }
    getBannedUserCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        const result = await this.getBannedUsersService.getBannedUsersService(actorId.sub, conversationId);
        return res.status(200).json(result);
    };
}
exports.GetBannedUsersController = GetBannedUsersController;
