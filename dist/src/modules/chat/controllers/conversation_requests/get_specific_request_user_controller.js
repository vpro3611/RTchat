"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificRequestUserController = exports.GetSpecificRequestUserParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetSpecificRequestUserParamsSchema = zod_1.z.object({
    requestId: zod_1.z.string().uuid(),
});
class GetSpecificRequestUserController {
    getSpecificRequestService;
    extractActorId;
    constructor(getSpecificRequestService, extractActorId) {
        this.getSpecificRequestService = getSpecificRequestService;
        this.extractActorId = extractActorId;
    }
    getSpecificRequestUserController = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { requestId } = req.params;
        const result = await this.getSpecificRequestService.getSpecificRequestUserService(actorId.sub, requestId);
        return res.status(200).json(result);
    };
}
exports.GetSpecificRequestUserController = GetSpecificRequestUserController;
