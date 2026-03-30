"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveConversationController = exports.LeaveConversationParamsSchema = void 0;
const zod_1 = require("zod");
exports.LeaveConversationParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class LeaveConversationController {
    leaveConversationService;
    extractActorId;
    constructor(leaveConversationService, extractActorId) {
        this.leaveConversationService = leaveConversationService;
        this.extractActorId = extractActorId;
    }
    leaveConversationCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        await this.leaveConversationService.leaveConversationTxService(actorId.sub, conversationId);
        return res.status(204).send();
    };
}
exports.LeaveConversationController = LeaveConversationController;
