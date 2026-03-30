"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroupConversationController = exports.CreateGroupConversationBodySchema = void 0;
const zod_1 = require("zod");
exports.CreateGroupConversationBodySchema = zod_1.z.object({
    title: zod_1.z.string().min(1)
});
class CreateGroupConversationController {
    createGroupConversationService;
    extractActorId;
    constructor(createGroupConversationService, extractActorId) {
        this.createGroupConversationService = createGroupConversationService;
        this.extractActorId = extractActorId;
    }
    createGroupConversationCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { title } = req.body;
        const result = await this.createGroupConversationService.createGroupConversationTxService(title, actorId.sub);
        return res.status(201).json(result);
    };
}
exports.CreateGroupConversationController = CreateGroupConversationController;
