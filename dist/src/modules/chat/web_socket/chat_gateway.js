"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const socket_io_1 = require("socket.io");
const http_errors_base_1 = require("../../../http_errors_base");
const user_auth_error_1 = require("../../authentification/errors/user_auth_error");
const send_message_controller_1 = require("../web_socket_controllers/message_controllers/send_message_controller");
const edit_message_controller_1 = require("../web_socket_controllers/message_controllers/edit_message_controller");
const delete_message_controller_1 = require("../web_socket_controllers/message_controllers/delete_message_controller");
const read_message_controller_1 = require("../web_socket_controllers/message_controllers/read_message_controller");
const start_typing_controller_1 = require("../web_socket_controllers/typing_controllers/start_typing_controller");
const stop_typing_controller_1 = require("../web_socket_controllers/typing_controllers/stop_typing_controller");
class ChatGateway {
    tokenServiceJWT;
    sendMessageController;
    editMessageController;
    deleteMessageController;
    markConversationAsReadController;
    getUserConversationsService;
    startTypingController;
    stopTypingController;
    io;
    ONLINE_USERS = new Map();
    constructor(server, tokenServiceJWT, sendMessageController, editMessageController, deleteMessageController, markConversationAsReadController, getUserConversationsService, startTypingController, stopTypingController) {
        this.tokenServiceJWT = tokenServiceJWT;
        this.sendMessageController = sendMessageController;
        this.editMessageController = editMessageController;
        this.deleteMessageController = deleteMessageController;
        this.markConversationAsReadController = markConversationAsReadController;
        this.getUserConversationsService = getUserConversationsService;
        this.startTypingController = startTypingController;
        this.stopTypingController = stopTypingController;
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
            }
        });
        this.initialize();
    }
    extractUserIdSocket(socket) {
        if (!socket.data.userId) {
            throw new user_auth_error_1.UserIdError("Authentification error");
        }
        return socket.data.userId;
    }
    evaluateErrors(error, myErrorMessage) {
        if (error instanceof Error) {
            return `${myErrorMessage}: ${error.message}`;
        }
        return myErrorMessage;
    }
    initialize() {
        this.io.use(this.authenticate);
        this.io.on("connection", this.onConnection);
    }
    authenticate = (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token || typeof token !== "string") {
                const message = process.env.NODE_ENV === "production"
                    ? "Unauthorized or invalid token format"
                    : `Unauthorized or invalid token format ${token} ${typeof token}`;
                return next(new http_errors_base_1.AuthentificationError(message));
            }
            const payload = this.tokenServiceJWT.verifyAccessToken(token);
            socket.data.userId = payload;
            next();
        }
        catch (error) {
            next(new http_errors_base_1.AuthentificationError("Unauthorized"));
        }
    };
    async autoJoinConversations(socket) {
        const userId = this.extractUserIdSocket(socket);
        const { items } = await this.getUserConversationsService.getUserConversationTxService(userId.sub);
        for (const conv of items) {
            socket.join(conv.id);
        }
    }
    onConnection = async (socket) => {
        const userId = this.extractUserIdSocket(socket);
        const sockets = this.ONLINE_USERS.get(userId.sub) ?? new Set();
        sockets.add(socket.id);
        this.ONLINE_USERS.set(userId.sub, sockets);
        this.io.emit("user:online", { userId: userId.sub });
        await this.autoJoinConversations(socket);
        this.registerEvents(socket);
        socket.on("disconnect", () => this.handleDisconnect(socket));
    };
    handleDisconnect = (socket) => {
        const userId = this.extractUserIdSocket(socket);
        const sockets = this.ONLINE_USERS.get(userId.sub);
        if (!sockets) {
            return;
        }
        sockets.delete(socket.id);
        if (sockets.size === 0) {
            this.ONLINE_USERS.delete(userId.sub);
            this.io.emit("user:offline", { userId: userId.sub });
        }
    };
    registerEvents(socket) {
        socket.on("conversation:join", ({ conversationId }) => {
            socket.join(conversationId);
        });
        socket.on("disconnect", (reason) => {
            const userId = this.extractUserIdSocket(socket);
            console.log(`Socket disconnected: ${userId.sub} because of ${reason}`);
        });
        socket.on("message:send", async (payload) => {
            try {
                const parsed = send_message_controller_1.SendMessageSchema.parse(payload);
                await this.sendMessageController.sendMessageController(socket, parsed.conversationId, parsed.content, this.io);
            }
            catch (error) {
                const msg = this.evaluateErrors(error, "Failed to send message");
                socket.emit("error", {
                    message: msg
                });
            }
        });
        socket.on("message:edit", async (payload) => {
            try {
                const parsed = edit_message_controller_1.EditMessageSchema.parse(payload);
                await this.editMessageController.editMessageController(socket, parsed.conversationId, parsed.messageId, parsed.newContent, this.io);
            }
            catch (error) {
                const msg = this.evaluateErrors(error, "Failed to edit message");
                socket.emit("error", {
                    message: msg
                });
            }
        });
        socket.on("message:delete", async (payload) => {
            try {
                const parsed = delete_message_controller_1.DeleteMessageSchema.parse(payload);
                await this.deleteMessageController.deleteMessageController(socket, parsed.conversationId, parsed.messageId, this.io);
            }
            catch (error) {
                const msg = this.evaluateErrors(error, "Failed to delete message");
                socket.emit("error", {
                    message: msg
                });
            }
        });
        socket.on("message:read", async (payload) => {
            try {
                const parsed = read_message_controller_1.ReadMessageSchema.parse(payload);
                await this.markConversationAsReadController.readMessageController(socket, parsed.conversationId, parsed.messageId, this.io);
            }
            catch (error) {
                const msg = this.evaluateErrors(error, "Failed to mark as read");
                socket.emit("error", {
                    message: msg
                });
            }
        });
        socket.on("typing:start", async (payload) => {
            try {
                const parsed = start_typing_controller_1.StartTypingSchema.parse(payload);
                await this.startTypingController.startTypingController(socket, parsed.conversationId, this.io);
            }
            catch (error) {
                const msg = this.evaluateErrors(error, "Failed to indicate typing start..");
                socket.emit("error", {
                    message: msg,
                });
            }
        });
        socket.on("typing:stop", async (payload) => {
            try {
                const parsed = stop_typing_controller_1.StopTypingSchema.parse(payload);
                await this.stopTypingController.stopTypingController(socket, parsed.conversationId, this.io);
            }
            catch (error) {
                const msg = this.evaluateErrors(error, "Failed to indicate typing stop..");
                socket.emit("error", {
                    message: msg
                });
            }
        });
    }
}
exports.ChatGateway = ChatGateway;
