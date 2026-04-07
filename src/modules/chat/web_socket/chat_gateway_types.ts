import {MessageDTO} from "../DTO/message_dto";
import {AccessTokenPayload} from "../../authentification/payloads/payloads";
import {Socket} from "socket.io";

export interface ClientToServerEvents {

    "conversation:join": (data: {
        conversationId: string
    }) => void

    "message:send": (data: {
        conversationId: string
        content: string
    }) => void

    "message:reply": (data: {
        conversationId: string,
        parentMessageId: string,
        content: string
    }) => void

    "message:edit": (data: {
        conversationId: string,
        messageId: string,
        newContent: string
    }) => void

    "message:delete": (data: {
        conversationId: string,
        messageId: string,
    }) => void

    "typing:start": (data: {
        conversationId: string
    }) => void

    "typing:stop": (data: {
        conversationId: string
    }) => void

    "message:read": (data: {
        conversationId: string,
        messageId: string
    }) => void
}

export interface ServerToClientEvents {
    "message:new": (message: MessageDTO) => void
    "message:edited": (message: MessageDTO) => void
    "message:deleted": (message: MessageDTO) => void

    "user:online": (data: {userId: string}) => void
    "user:offline": (data: {userId: string}) => void
    "user:online_list": (data: {userIds: string[]}) => void

    "typing:start": (data: {userId: string, conversationId: string}) => void
    "typing:stop": (data: {userId: string, conversationId: string}) => void

    "message:read": (data: {userId: string, conversationId: string, messageId: string}) => void

    "participant:added": (data: { conversationId: string, participant: any }) => void
    "participant:removed": (data: { conversationId: string, userId: string }) => void
    "participant:updated": (data: { conversationId: string, participant: any }) => void
    "conversation:updated": (data: { conversationId: string, conversation: any }) => void

    "error": (error: {message: string}) => void

}

export interface SocketData {
    userId: AccessTokenPayload,
}

export type AuthSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>