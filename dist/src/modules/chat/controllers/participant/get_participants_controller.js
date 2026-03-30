"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetParticipantsController = exports.GetParticipantsQuerySchema = exports.GetParticipantsParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetParticipantsParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
exports.GetParticipantsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    cursor: zod_1.z.string().optional(),
});
class GetParticipantsController {
    getParticipantsService;
    extractActorId;
    constructor(getParticipantsService, extractActorId) {
        this.getParticipantsService = getParticipantsService;
        this.extractActorId = extractActorId;
    }
    getParticipantsCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        const { limit, cursor } = exports.GetParticipantsQuerySchema.parse(req.query);
        const result = await this.getParticipantsService.getParticipantsTxService(actorId.sub, conversationId, limit, cursor);
        return res.status(200).json(result);
    };
}
exports.GetParticipantsController = GetParticipantsController;
