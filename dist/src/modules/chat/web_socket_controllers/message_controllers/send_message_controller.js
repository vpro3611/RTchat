"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageController = exports.SendMessageSchema = void 0;
const zod_1 = require("zod");
exports.SendMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    content: zod_1.z.string(),
});
class SendMessageController {
    sendMessageService;
    constructor(sendMessageService) {
        this.sendMessageService = sendMessageService;
    }
    sendMessageController = async (socket, conversationId, content, io) => {
        const userId = socket.data.userId;
        const message = await this.sendMessageService.sendMessageTxService(userId.sub, conversationId, content);
        io.to(conversationId).emit("message:new", message);
    };
}
exports.SendMessageController = SendMessageController;
