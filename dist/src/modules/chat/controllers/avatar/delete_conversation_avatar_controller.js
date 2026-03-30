"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteConversationAvatarController = exports.DeleteConversationAvatarParamsSchema = void 0;
const zod_1 = require("zod");
exports.DeleteConversationAvatarParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class DeleteConversationAvatarController {
    deleteConversationAvatarService;
    extractActorId;
    constructor(deleteConversationAvatarService, extractActorId) {
        this.deleteConversationAvatarService = deleteConversationAvatarService;
        this.extractActorId = extractActorId;
    }
    deleteAvatar = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const conversationId = req.params.conversationId;
        await this.deleteConversationAvatarService.deleteConversationAvatar(conversationId, actorId.sub);
        return res.status(204).send();
    };
}
exports.DeleteConversationAvatarController = DeleteConversationAvatarController;
