"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnbanGroupParticipantController = exports.UnbanGroupParticipantParamsSchema = void 0;
const zod_1 = require("zod");
exports.UnbanGroupParticipantParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
class UnbanGroupParticipantController {
    unbanGroupParticipantService;
    extractUserId;
    constructor(unbanGroupParticipantService, extractUserId) {
        this.unbanGroupParticipantService = unbanGroupParticipantService;
        this.extractUserId = extractUserId;
    }
    unbanGroupParticipantCont = async (req, res) => {
        const actorId = this.extractUserId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        await this.unbanGroupParticipantService.unbanGroupParticipantService(actorId.sub, conversationId, targetId);
        return res.status(204).send();
    };
}
exports.UnbanGroupParticipantController = UnbanGroupParticipantController;
