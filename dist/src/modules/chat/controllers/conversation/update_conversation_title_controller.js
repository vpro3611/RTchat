"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConversationTitleController = exports.UpdateConversationTitleParamsSchema = exports.UpdateConversationTitleBodySchema = void 0;
const zod_1 = require("zod");
exports.UpdateConversationTitleBodySchema = zod_1.z.object({
    title: zod_1.z.string().min(1)
});
exports.UpdateConversationTitleParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class UpdateConversationTitleController {
    updateConversationTitleService;
    extractActorId;
    constructor(updateConversationTitleService, extractActorId) {
        this.updateConversationTitleService = updateConversationTitleService;
        this.extractActorId = extractActorId;
    }
    updateConversationTitleCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        const { title } = req.body;
        const result = await this.updateConversationTitleService.updateConversationTitleTxService(actorId.sub, conversationId, title);
        return res.status(200).json(result);
    };
}
exports.UpdateConversationTitleController = UpdateConversationTitleController;
