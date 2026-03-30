"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeParticipantRoleController = exports.ChangeParticipantRoleParamsSchema = void 0;
const zod_1 = require("zod");
exports.ChangeParticipantRoleParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    targetId: zod_1.z.string().uuid(),
});
class ChangeParticipantRoleController {
    changeParticipantRoleService;
    extractActorId;
    constructor(changeParticipantRoleService, extractActorId) {
        this.changeParticipantRoleService = changeParticipantRoleService;
        this.extractActorId = extractActorId;
    }
    changeParticipantRoleCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, targetId } = req.params;
        const result = await this.changeParticipantRoleService.changeParticipantRoleTxService(actorId.sub, conversationId, targetId);
        return res.status(200).json(result);
    };
}
exports.ChangeParticipantRoleController = ChangeParticipantRoleController;
