import {DeleteMessageTxService} from "../../transactional_services/message/delete_message_service";
import {Server} from "socket.io";
import {AuthSocket} from "../../web_socket/chat_gateway_types";
import {z} from "zod";

export const DeleteMessageSchema = z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
})


export class DeleteMessageController {
    constructor(private readonly deleteMessageService: DeleteMessageTxService) {}

    deleteMessageController =
        async (
            socket: AuthSocket,
            conversationId: string,
            messageId: string,
            io: Server
        ) =>
        {
            const userId = socket.data.userId;

            const message = await this.deleteMessageService.deleteMessageTxService(
                userId.sub,
                conversationId,
                messageId
            );

            io.to(conversationId).emit("message:deleted", {
                message: message
            });
    }
}