"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinConversationController = exports.JoinConversationParamsSchema = void 0;
const zod_1 = require("zod");
exports.JoinConversationParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class JoinConversationController {
    joinConversationService;
    extractActorId;
    constructor(joinConversationService, extractActorId) {
        this.joinConversationService = joinConversationService;
        this.extractActorId = extractActorId;
    }
    joinConversationCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        const result = await this.joinConversationService.joinConversationTxService(actorId.sub, conversationId);
        return res.status(200).json(result);
    };
}
exports.JoinConversationController = JoinConversationController;
