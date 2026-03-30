"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveSavedMessageController = exports.RemoveSavedMessageParamsSchema = void 0;
const zod_1 = require("zod");
exports.RemoveSavedMessageParamsSchema = zod_1.z.object({
    messageId: zod_1.z.string().uuid(),
});
class RemoveSavedMessageController {
    removeSavedMessageService;
    extractActorId;
    constructor(removeSavedMessageService, extractActorId) {
        this.removeSavedMessageService = removeSavedMessageService;
        this.extractActorId = extractActorId;
    }
    removeSavedMessageCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { messageId } = req.params;
        await this.removeSavedMessageService.removeSavedMessageService(actorId.sub, messageId);
        return res.status(204).send();
    };
}
exports.RemoveSavedMessageController = RemoveSavedMessageController;
