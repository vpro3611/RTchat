import {Server, Socket} from "socket.io";
import {ClientToServerEvents, ServerToClientEvents, SocketData} from "./chat_gateway_types";
import {Server as HTTPServer} from "http"
import {SendMessageTxService} from "../transactional_services/message/send_message_service";
import {EditMessageTxService} from "../transactional_services/message/edit_message_service";
import {DeleteMessageTxService} from "../transactional_services/message/delete_message_service";
import {JoinConversationTxService} from "../transactional_services/participant/join_conversation_service";
import {AuthentificationError} from "../../../http_errors_base";
import {TokenServiceJWT} from "../../authentification/jwt_token_service/token_service";
import {UserIdError} from "../../authentification/errors/user_auth_error";
import {GetUserConversationsTxService} from "../transactional_services/conversation/get_user_conversations_service";
import {MarkConversationReadTxService} from "../transactional_services/conversation/mark_conversation_read_service";

export class ChatGateway {
    private io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>

    private ONLINE_USERS = new Map<string, Set<string>>();

    constructor(
        server: HTTPServer,
        private tokenServiceJWT: TokenServiceJWT,
        private sendMessageService: SendMessageTxService,
        private editMessageService: EditMessageTxService,
        private deleteMessageService: DeleteMessageTxService,
        private getUserConversationsService: GetUserConversationsTxService,
        private markConversationAsReadService: MarkConversationReadTxService,
    ) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
            }
        });
        this.initialize();
    }

    private extractUserIdSocket(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
        if (!socket.data.userId) {
            throw new UserIdError("Authentification error")
        }
        return socket.data.userId;
    }

    private evaluateErrors(error: unknown, myErrorMessage: string) {
        if (error instanceof Error) {
            return `${myErrorMessage}: ${error.message}`
        }
        return myErrorMessage;
    }

    private initialize() {
        this.io.use(this.authenticate);

        this.io.on("connection", this.onConnection);
    }

    private authenticate =
        (socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, next: (err?: Error) => void) => {
            try {
                const token = socket.handshake.auth?.token;
                if (!token || typeof token !== "string") {
                    const message = process.env.NODE_ENV === "production"
                        ? "Unauthorized or invalid token format"
                        : `Unauthorized or invalid token format ${token} ${typeof token}`;
                    return next(new AuthentificationError(message));
                }
                const payload = this.tokenServiceJWT.verifyAccessToken(token);

                socket.data.userId = payload

                next();
            } catch (error) {
                next(new AuthentificationError("Unauthorized"));
            }
        }

    private async autoJoinConversations(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
        const userId = this.extractUserIdSocket(socket);

        const {items} = await this.getUserConversationsService.getUserConversationTxService(userId.sub);

        for (const conv of items) {
            socket.join(conv.id);
        }
    }

    private onConnection =
        async (socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) =>
        {
            const userId = this.extractUserIdSocket(socket);

            const sockets = this.ONLINE_USERS.get(userId.sub) ?? new Set();

            sockets.add(socket.id);

            this.ONLINE_USERS.set(userId.sub, sockets);

            this.io.emit("user:online", {userId: userId.sub});

            await this.autoJoinConversations(socket);

            this.registerEvents(socket);

            socket.on("disconnect", () => this.handleDisconnect(socket));
        }

    private handleDisconnect = (socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) => {
        const userId = this.extractUserIdSocket(socket);

        const sockets = this.ONLINE_USERS.get(userId.sub);

        if (!sockets) {
            return;
        }

        sockets.delete(socket.id);

        if (sockets.size === 0) {
            this.ONLINE_USERS.delete(userId.sub);
            this.io.emit("user:offline", {userId: userId.sub});
        }
    }

    private registerEvents(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
        socket.on("conversation:join", ({ conversationId }) => {

            socket.join(conversationId)

        })

        socket.on("disconnect", (reason) => {
            const userId = this.extractUserIdSocket(socket);
            console.log(`Socket disconnected: ${userId.sub} because of ${reason}`);
        })

        socket.on("message:send", async ({conversationId, content }) => {
            try {
                const userId = this.extractUserIdSocket(socket);

                const message = await this.sendMessageService.sendMessageTxService(
                    userId.sub,
                    conversationId,
                    content
                );

                this.io.to(conversationId).emit("message:new", message);
            } catch (error: unknown) {
                const msg = this.evaluateErrors(error, "Failed to send message");
                socket.emit("error", {
                    message: msg
                })
            }
        })

        socket.on("message:edit", async ({conversationId, messageId, newContent}) => {
            try {
                const userId = this.extractUserIdSocket(socket);

                const message = await this.editMessageService.editMessageTxService(
                    userId.sub,
                    conversationId,
                    messageId,
                    newContent
                );

                this.io.to(conversationId).emit("message:edited", message)
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to edit message");
                socket.emit("error", {
                    message: msg
                })
            }
        })

        socket.on("message:delete", async ({conversationId, messageId}) => {
            try {
                const userId = this.extractUserIdSocket(socket);

                const message = await this.deleteMessageService.deleteMessageTxService(
                    userId.sub,
                    conversationId,
                    messageId
                );

                this.io.to(conversationId).emit("message:deleted", message);
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to delete message")
                socket.emit("error", {
                    message: msg
                });
            }
        })

        socket.on("message:read", async ({conversationId, messageId}) => {
            try {
                const userId = this.extractUserIdSocket(socket);

                await this.markConversationAsReadService.markConversationReadTxService(
                    userId.sub,
                    conversationId,
                    messageId
                );

                this.io.to(conversationId).emit("message:read", {
                    userId: userId.sub,
                    conversationId: conversationId,
                    messageId: messageId
                });
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to mark as read")
                socket.emit("error", {
                    message: msg
                });
            }
        })

        socket.on("typing:start", ({conversationId}) => {
            const userId = this.extractUserIdSocket(socket);
            socket.to(conversationId).emit("typing:start", {
                userId: userId.sub,
                conversationId: conversationId
            });
        });

        socket.on("typing:stop", ({conversationId}) => {
            const userId = this.extractUserIdSocket(socket);
            socket.to(conversationId).emit("typing:stop", {
                userId: userId.sub,
                conversationId: conversationId
            });
        });
    }
}