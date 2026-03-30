"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveRequestController = exports.RemoveRequestParamsSchema = void 0;
const zod_1 = require("zod");
exports.RemoveRequestParamsSchema = zod_1.z.object({
    requestId: zod_1.z.string().uuid(),
});
class RemoveRequestController {
    removeRequestService;
    extractActorId;
    constructor(removeRequestService, extractActorId) {
        this.removeRequestService = removeRequestService;
        this.extractActorId = extractActorId;
    }
    removeRequestCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { requestId } = req.params;
        await this.removeRequestService.removeRequestService(actorId.sub, requestId);
        return res.status(204).send();
    };
}
exports.RemoveRequestController = RemoveRequestController;
