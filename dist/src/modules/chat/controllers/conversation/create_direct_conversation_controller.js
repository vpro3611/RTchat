"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDirectConversationController = exports.CreateDirectConversationParamsSchema = void 0;
const zod_1 = require("zod");
exports.CreateDirectConversationParamsSchema = zod_1.z.object({
    targetId: zod_1.z.string().uuid(),
});
class CreateDirectConversationController {
    createDirectConversationService;
    extractActorId;
    constructor(createDirectConversationService, extractActorId) {
        this.createDirectConversationService = createDirectConversationService;
        this.extractActorId = extractActorId;
    }
    ;
    createDirectConversationCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { targetId } = req.params;
        const result = await this.createDirectConversationService.createDirectConversationTxService(actorId.sub, targetId);
        return res.status(201).json(result);
    };
}
exports.CreateDirectConversationController = CreateDirectConversationController;
