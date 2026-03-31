import {Server} from "socket.io";
import {AuthSocket, ClientToServerEvents, ServerToClientEvents, SocketData} from "./chat_gateway_types";
import {Server as HTTPServer} from "http"
import {AuthentificationError} from "../../../http_errors_base";
import {TokenServiceJWT} from "../../authentification/jwt_token_service/token_service";
import {UserIdError} from "../../authentification/errors/user_auth_error";
import {GetUserConversationsTxService} from "../transactional_services/conversation/get_user_conversations_service";
import {SendMessageController, SendMessageSchema} from "../web_socket_controllers/message_controllers/send_message_controller";
import {EditMessageController, EditMessageSchema} from "../web_socket_controllers/message_controllers/edit_message_controller";
import {DeleteMessageController, DeleteMessageSchema} from "../web_socket_controllers/message_controllers/delete_message_controller";
import {MarkConversationAsReadController, ReadMessageSchema} from "../web_socket_controllers/message_controllers/read_message_controller";
import {StartTypingController, StartTypingSchema} from "../web_socket_controllers/typing_controllers/start_typing_controller";
import {StopTypingController, StopTypingSchema} from "../web_socket_controllers/typing_controllers/stop_typing_controller";

export class ChatGateway {
    private io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>

    private ONLINE_USERS = new Map<string, Set<string>>();

    constructor(
        server: HTTPServer,
        private tokenServiceJWT: TokenServiceJWT,
        private sendMessageController: SendMessageController,
        private editMessageController: EditMessageController,
        private deleteMessageController: DeleteMessageController,
        private markConversationAsReadController: MarkConversationAsReadController,
        private getUserConversationsService: GetUserConversationsTxService,
        private startTypingController: StartTypingController,
        private stopTypingController: StopTypingController,
    ) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
            }
        });
        this.initialize();
    }

    public updateControllers(
        sendMessageController: SendMessageController,
        editMessageController: EditMessageController,
        deleteMessageController: DeleteMessageController,
        markConversationAsReadController: MarkConversationAsReadController,
        getUserConversationsService: GetUserConversationsTxService,
        startTypingController: StartTypingController,
        stopTypingController: StopTypingController,
    ) {
        this.sendMessageController = sendMessageController;
        this.editMessageController = editMessageController;
        this.deleteMessageController = deleteMessageController;
        this.markConversationAsReadController = markConversationAsReadController;
        this.getUserConversationsService = getUserConversationsService;
        this.startTypingController = startTypingController;
        this.stopTypingController = stopTypingController;
    }

    isConnected() {
        return this.io.engine.clientsCount > 0;
    }

    getIo() {
        return this.io;
    }

    private extractUserIdSocket(socket: AuthSocket) {
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
        (socket: AuthSocket, next: (err?: Error) => void) => {
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

    private async autoJoinConversations(socket: AuthSocket) {
        const userId = this.extractUserIdSocket(socket);

        const {items} = await this.getUserConversationsService.getUserConversationTxService(userId.sub);

        for (const conv of items) {
            socket.join(conv.id);
        }
    }

    private onConnection =
        async (socket: AuthSocket) =>
        {
            const userId = this.extractUserIdSocket(socket);

            const sockets = this.ONLINE_USERS.get(userId.sub) ?? new Set();

            sockets.add(socket.id);

            this.ONLINE_USERS.set(userId.sub, sockets);

            // Join personal room for targeted notifications
            socket.join(`user:${userId.sub}`);

            this.io.emit("user:online", {userId: userId.sub});

            await this.autoJoinConversations(socket);

            this.registerEvents(socket);

            socket.on("disconnect", () => this.handleDisconnect(socket));
        }

    private handleDisconnect = (socket: AuthSocket) => {
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

    private registerEvents(socket: AuthSocket) {
        socket.on("conversation:join", ({ conversationId }) => {
            socket.join(conversationId)
        })

        socket.on("disconnect", (reason) => {
            const userId = this.extractUserIdSocket(socket);
            console.log(`Socket disconnected: ${userId.sub} because of ${reason}`);
        })

        socket.on("message:send", async (payload) => {
            try {
                const parsed = SendMessageSchema.parse(payload);

                await this.sendMessageController.sendMessageController(
                    socket,
                    parsed.conversationId,
                    parsed.content,
                    this.io
                );
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to send message");
                socket.emit("error", {
                    message: msg
                });
            }
        })

        socket.on("message:edit", async (payload) => {
            try {
                const parsed = EditMessageSchema.parse(payload)

                await this.editMessageController.editMessageController(
                    socket,
                    parsed.conversationId,
                    parsed.messageId,
                    parsed.newContent,
                    this.io
                );
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to edit message");
                socket.emit("error", {
                    message: msg
                });
            }
        })

        socket.on("message:delete", async (payload) => {
            try {
                const parsed = DeleteMessageSchema.parse(payload);

                await this.deleteMessageController.deleteMessageController(
                    socket,
                    parsed.conversationId,
                    parsed.messageId,
                    this.io
                );
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to delete message")
                socket.emit("error", {
                    message: msg
                });
            }
        })

        socket.on("message:read", async (payload) => {
            try {

                const parsed = ReadMessageSchema.parse(payload);

                await this.markConversationAsReadController.readMessageController(
                    socket,
                    parsed.conversationId,
                    parsed.messageId,
                    this.io
                );
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to mark as read")
                socket.emit("error", {
                    message: msg
                });
            }
        })

        socket.on("typing:start", async (payload) => {
            try {
                const parsed = StartTypingSchema.parse(payload);

                await this.startTypingController.startTypingController(
                    socket,
                    parsed.conversationId,
                    this.io
                );
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to indicate typing start..");
                socket.emit("error", {
                    message: msg,
                });
            }
        });

        socket.on("typing:stop", async (payload) => {
            try {
                const parsed = StopTypingSchema.parse(payload);

                await this.stopTypingController.stopTypingController(
                    socket,
                    parsed.conversationId,
                    this.io
                )
            } catch (error) {
                const msg = this.evaluateErrors(error, "Failed to indicate typing stop..")
                socket.emit("error", {
                    message: msg
                });
            }
        });
    }
}