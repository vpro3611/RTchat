"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartTypingController = exports.StartTypingSchema = void 0;
const zod_1 = require("zod");
exports.StartTypingSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid(),
});
class StartTypingController {
    startTypingController = async (socket, conversationId, io) => {
        const userId = socket.data.userId;
        io.to(conversationId).emit("typing:started", {
            userId: userId.sub,
            conversationId: conversationId,
        });
    };
}
exports.StartTypingController = StartTypingController;
