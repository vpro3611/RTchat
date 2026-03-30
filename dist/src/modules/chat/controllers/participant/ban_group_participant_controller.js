"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanGroupParticipantController = exports.BanGroupParticipantBodySchema = exports.BanGroupParticipantParamsSchema = void 0;
const zod_1 = require("zod");
exports.BanGroupParticipantParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
exports.BanGroupParticipantBodySchema = zod_1.z.object({
    reason: zod_1.z.string().min(1),
});
class BanGroupParticipantController {
    banGroupParticipantService;
    extractUserId;
    constructor(banGroupParticipantService, extractUserId) {
        this.banGroupParticipantService = banGroupParticipantService;
        this.extractUserId = extractUserId;
    }
    banGroupParticipantCont = async (req, res) => {
        const actorId = this.extractUserId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        const { reason } = req.body;
        const result = await this.banGroupParticipantService.banGroupParticipantService(conversationId, targetId, actorId.sub, reason);
        return res.status(200).json(result);
    };
}
exports.BanGroupParticipantController = BanGroupParticipantController;
