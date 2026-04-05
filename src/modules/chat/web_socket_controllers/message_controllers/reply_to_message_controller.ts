import {ReplyToMessageTxService} from "../../transactional_services/message/reply_to_message_service";
import {Server} from "socket.io";
import {AuthSocket} from "../../web_socket/chat_gateway_types";
import {z} from "zod";

export const ReplyToMessageSchema = z.object({
    conversationId: z.string().uuid(),
    parentMessageId: z.string().uuid(),
    content: z.string(),
});

export class ReplyToMessageSocketController {
    constructor(private readonly replyToMessageService: ReplyToMessageTxService) {}

    replyToMessageController = async (
        socket: AuthSocket,
        conversationId: string,
        parentMessageId: string,
        content: string,
        io: Server
    ) =>
    {
        const userId = socket.data.userId;

        const message =
            await this.replyToMessageService.replyToMessageTxService(
                userId.sub,
                conversationId,
                parentMessageId,
                content,
                []
            );

        io.to(conversationId).emit("message:new", message);
    }
}
