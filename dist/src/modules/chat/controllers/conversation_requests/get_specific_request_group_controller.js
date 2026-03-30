"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificRequestGroupController = exports.GetSpecificRequestGroupParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetSpecificRequestGroupParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    requestId: zod_1.z.string().uuid(),
});
class GetSpecificRequestGroupController {
    getSpecificRequestGroupService;
    extractActorId;
    constructor(getSpecificRequestGroupService, extractActorId) {
        this.getSpecificRequestGroupService = getSpecificRequestGroupService;
        this.extractActorId = extractActorId;
    }
    getSpecificRequestGroupCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId, requestId } = req.params;
        const result = await this.getSpecificRequestGroupService.getSpecificRequestGroupService(actorId.sub, conversationId, requestId);
        return res.status(200).json(result);
    };
}
exports.GetSpecificRequestGroupController = GetSpecificRequestGroupController;
