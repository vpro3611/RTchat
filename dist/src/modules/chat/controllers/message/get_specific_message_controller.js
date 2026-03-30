"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificMessageController = exports.GetSpecificMessageParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetSpecificMessageParamsSchema = zod_1.z.object({
    messageId: zod_1.z.string().uuid(),
    conversationId: zod_1.z.string().uuid(),
});
class GetSpecificMessageController {
    getSpecificMessageService;
    extractActorId;
    constructor(getSpecificMessageService, extractActorId) {
        this.getSpecificMessageService = getSpecificMessageService;
        this.extractActorId = extractActorId;
    }
    getSpecificMessageCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { messageId, conversationId } = req.params;
        const result = await this.getSpecificMessageService.getSpecificMessageService(actorId.sub, conversationId, messageId);
        return res.status(200).json(result);
    };
}
exports.GetSpecificMessageController = GetSpecificMessageController;
