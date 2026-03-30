"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveMessageController = exports.SaveMessageParamsSchema = void 0;
const zod_1 = require("zod");
exports.SaveMessageParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    messageId: zod_1.z.string().uuid(),
});
class SaveMessageController {
    saveMessageService;
    extractActorId;
    constructor(saveMessageService, extractActorId) {
        this.saveMessageService = saveMessageService;
        this.extractActorId = extractActorId;
    }
    saveMessageCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, messageId } = req.params;
        const result = await this.saveMessageService.saveMessageService(actorId.sub, messageId, conversationId);
        return res.status(201).send(result);
    };
}
exports.SaveMessageController = SaveMessageController;
