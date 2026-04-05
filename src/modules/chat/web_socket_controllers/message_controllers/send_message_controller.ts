import {SendMessageTxService} from "../../transactional_services/message/send_message_service";
import {Server} from "socket.io";
import {AuthSocket} from "../../web_socket/chat_gateway_types";

import {z} from "zod"

export const SendMessageSchema = z.object({
    conversationId: z.string().uuid(),
    content: z.string(),
    parentMessageId: z.string().uuid().optional(),
})


export class SendMessageController {
    constructor(private readonly sendMessageService: SendMessageTxService) {}

    sendMessageController = async (
        socket: AuthSocket,
        conversationId: string,
        content: string,
        io: Server,
        parentMessageId?: string
    ) =>
    {

        const userId = socket.data.userId;

        const message =
            await this.sendMessageService.sendMessageTxService(
                userId.sub,
                conversationId,
                content,
                [],
                parentMessageId
            );

        io.to(conversationId).emit("message:new", message);
    }
}