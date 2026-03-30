"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMessageController = exports.DeleteMessageSchema = void 0;
const zod_1 = require("zod");
exports.DeleteMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
    messageId: zod_1.z.string().uuid(),
});
class DeleteMessageController {
    deleteMessageService;
    constructor(deleteMessageService) {
        this.deleteMessageService = deleteMessageService;
    }
    deleteMessageController = async (socket, conversationId, messageId, io) => {
        const userId = socket.data.userId;
        const message = await this.deleteMessageService.deleteMessageTxService(userId.sub, conversationId, messageId);
        io.to(conversationId).emit("message:deleted", {
            message: message
        });
    };
}
exports.DeleteMessageController = DeleteMessageController;
