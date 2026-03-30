"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteParticipantController = exports.MuteParticipantBodySchema = exports.MuteParticipantParamsSchema = void 0;
const zod_1 = require("zod");
const mute_duration_1 = require("../../domain/participant/mute_duration");
exports.MuteParticipantParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
const MuteDurationSchema = zod_1.z.enum(Object.values(mute_duration_1.MuteDuration));
exports.MuteParticipantBodySchema = zod_1.z.object({
    duration: MuteDurationSchema,
});
class MuteParticipantController {
    muteParticipantService;
    extractActorId;
    constructor(muteParticipantService, extractActorId) {
        this.muteParticipantService = muteParticipantService;
        this.extractActorId = extractActorId;
    }
    muteParticipantCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        const { duration } = req.body;
        const result = await this.muteParticipantService.muteParticipantTxService(actorId.sub, targetId, conversationId, duration);
        return res.status(200).json(result);
    };
}
exports.MuteParticipantController = MuteParticipantController;
