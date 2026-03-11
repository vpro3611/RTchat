import {MarkConversationReadTxService} from "../../transactional_services/conversation/mark_conversation_read_service";
import {Server} from "socket.io";
import {AuthSocket} from "../../web_socket/chat_gateway_types";
import {z} from "zod";


export const ReadMessageSchema = z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
})

export class MarkConversationAsReadController {
    constructor(private readonly markConversationReadTxService: MarkConversationReadTxService) {}

    readMessageController =
        async (
            socket: AuthSocket,
            conversationId: string,
            messageId: string,
            io: Server
        ) =>
        {
            const userId = socket.data.userId;

            await this.markConversationReadTxService.markConversationReadTxService(userId.sub, conversationId, messageId);

            io.to(conversationId).emit("message:read", {
                userId: userId.sub,
                conversationId: conversationId,
                messageId: messageId,
        });
    }
}