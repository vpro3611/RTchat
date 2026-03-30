"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetConversationAvatarController = exports.SetConversationAvatarParamsSchema = void 0;
const zod_1 = require("zod");
exports.SetConversationAvatarParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class SetConversationAvatarController {
    setConversationAvatarService;
    extractActorId;
    constructor(setConversationAvatarService, extractActorId) {
        this.setConversationAvatarService = setConversationAvatarService;
        this.extractActorId = extractActorId;
    }
    setAvatar = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const conversationId = req.params.conversationId;
        if (!req.file) {
            return res.status(400).json({ message: "Avatar file is required" });
        }
        const avatarId = await this.setConversationAvatarService.setConversationAvatar(conversationId, actorId.sub, req.file.buffer);
        return res.status(201).json({ avatarId });
    };
}
exports.SetConversationAvatarController = SetConversationAvatarController;
