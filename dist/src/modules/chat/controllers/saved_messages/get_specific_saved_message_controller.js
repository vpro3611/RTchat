"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificSavedMessageController = exports.GetSpecificSavedMessageParamsSchema = void 0;
const zod_1 = require("zod");
exports.GetSpecificSavedMessageParamsSchema = zod_1.z.object({
    messageId: zod_1.z.string().uuid(),
});
class GetSpecificSavedMessageController {
    getSpecificSavedMessageService;
    extractActorId;
    constructor(getSpecificSavedMessageService, extractActorId) {
        this.getSpecificSavedMessageService = getSpecificSavedMessageService;
        this.extractActorId = extractActorId;
    }
    getSpecificSavedMessageCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { messageId } = req.params;
        const result = await this.getSpecificSavedMessageService.getSpecificSavedMessageService(actorId.sub, messageId);
        return res.status(200).json(result);
    };
}
exports.GetSpecificSavedMessageController = GetSpecificSavedMessageController;
