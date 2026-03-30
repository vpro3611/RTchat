"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnmuteParticipantController = exports.UnmuteParticipantParamsSchema = void 0;
const zod_1 = require("zod");
exports.UnmuteParticipantParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
class UnmuteParticipantController {
    unmuteParticipantService;
    extractUserId;
    constructor(unmuteParticipantService, extractUserId) {
        this.unmuteParticipantService = unmuteParticipantService;
        this.extractUserId = extractUserId;
    }
    unmuteParticipantCont = async (req, res) => {
        const actorId = this.extractUserId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        const result = await this.unmuteParticipantService.unmuteParticipantTxService(actorId.sub, targetId, conversationId);
        return res.status(200).json(result);
    };
}
exports.UnmuteParticipantController = UnmuteParticipantController;
