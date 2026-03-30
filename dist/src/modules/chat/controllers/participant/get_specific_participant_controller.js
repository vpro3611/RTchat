"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificParticipantController = exports.GetSpecificParticipantParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetSpecificParticipantParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
class GetSpecificParticipantController {
    getSpecificParticipantService;
    extractActorId;
    constructor(getSpecificParticipantService, extractActorId) {
        this.getSpecificParticipantService = getSpecificParticipantService;
        this.extractActorId = extractActorId;
    }
    getSpecificParticipantController = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        const result = await this.getSpecificParticipantService.getSpecificParticipantService(actorId.sub, conversationId, targetId);
        return res.status(200).json(result);
    };
}
exports.GetSpecificParticipantController = GetSpecificParticipantController;
