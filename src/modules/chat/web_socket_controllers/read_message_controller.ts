import {MarkConversationReadTxService} from "../transactional_services/conversation/mark_conversation_read_service";
import {Server} from "socket.io";
import {AuthSocket} from "../web_socket/chat_gateway_types";
import {z} from "zod";


export const ReadMessageSchema = z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
})

export class MarkConversationAsReadController {
    constructor(private readonly markConversationReadTxService: MarkConversationReadTxService,
                private io: Server
    ) {}

    readMessageController = async (socket: AuthSocket, conversationId: string, messageId: string) => {
        const userId = socket.data.userId;

        await this.markConversationReadTxService.markConversationReadTxService(userId.sub, conversationId, messageId);

        this.io.to(conversationId).emit("message:read", {
            userId: userId.sub,
            conversationId: conversationId,
            messageId: messageId,
        });
    }
}