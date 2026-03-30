"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateConversationRequestController = exports.CreateConversationRequestParamsSchema = exports.CreateConversationRequestBodySchema = void 0;
const zod_1 = require("zod");
exports.CreateConversationRequestBodySchema = zod_1.z.object({
    requestMessage: zod_1.z.string().min(1),
});
exports.CreateConversationRequestParamsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class CreateConversationRequestController {
    createConversationRequestService;
    extractActorId;
    constructor(createConversationRequestService, extractActorId) {
        this.createConversationRequestService = createConversationRequestService;
        this.extractActorId = extractActorId;
    }
    createConvRequestCont = async (req, res) => {
        const actorId = this.extractActorId.extractActorId(req);
        const { conversationId } = req.params;
        const { requestMessage } = req.body;
        const result = await this.createConversationRequestService.createConversationRequestService(actorId.sub, conversationId, requestMessage);
        return res.status(201).json(result);
    };
}
exports.CreateConversationRequestController = CreateConversationRequestController;
