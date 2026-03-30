"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMessagesController = exports.GetMessagesQuerySchema = exports.GetMessagesParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetMessagesParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
exports.GetMessagesQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    cursor: zod_1.z.string().optional(),
});
class GetMessagesController {
    getMessagesService;
    extractActorId;
    constructor(getMessagesService, extractActorId) {
        this.getMessagesService = getMessagesService;
        this.extractActorId = extractActorId;
    }
    getMessagesCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        const { limit, cursor } = exports.GetMessagesQuerySchema.parse(req.query);
        const result = await this.getMessagesService.getMessageTxService(actorId.sub, conversationId, limit, cursor);
        return res.status(200).json(result);
    };
}
exports.GetMessagesController = GetMessagesController;
