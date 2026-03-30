"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveParticipantController = exports.RemoveParticipantParamsSchema = void 0;
const zod_1 = require("zod");
exports.RemoveParticipantParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
class RemoveParticipantController {
    removeParticipantService;
    extractActorId;
    constructor(removeParticipantService, extractActorId) {
        this.removeParticipantService = removeParticipantService;
        this.extractActorId = extractActorId;
    }
    removeParticipantCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        const result = await this.removeParticipantService.removeParticipantTxService(actorId.sub, conversationId, targetId);
        return res.status(200).json(result);
    };
}
exports.RemoveParticipantController = RemoveParticipantController;
