"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddParticipantToAConversationController = exports.AddParticipantToAConversationParamsSchema = void 0;
const zod_1 = require("zod");
exports.AddParticipantToAConversationParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
class AddParticipantToAConversationController {
    addParticipantService;
    extractActorId;
    constructor(addParticipantService, extractActorId) {
        this.addParticipantService = addParticipantService;
        this.extractActorId = extractActorId;
    }
    addParticipantToAConversationCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        const result = await this.addParticipantService.addParticipantToConversationTxService(actorId.sub, targetId, conversationId);
        return res.status(201).json(result);
    };
}
exports.AddParticipantToAConversationController = AddParticipantToAConversationController;
