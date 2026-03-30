"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserConversationController = exports.GetUserConversationQuerySchema = void 0;
const zod_1 = require("zod");
exports.GetUserConversationQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    cursor: zod_1.z.string().optional(),
});
class GetUserConversationController {
    getUserConversationService;
    extractActorId;
    constructor(getUserConversationService, extractActorId) {
        this.getUserConversationService = getUserConversationService;
        this.extractActorId = extractActorId;
    }
    getUserConversationCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { limit, cursor } = exports.GetUserConversationQuerySchema.parse(req.query);
        const result = await this.getUserConversationService.getUserConversationTxService(actorId.sub, limit, cursor);
        return res.status(200).json(result);
    };
}
exports.GetUserConversationController = GetUserConversationController;
