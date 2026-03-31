import {ConversationType} from "../domain/conversation/conversation_type";
import {ConversationTitle} from "../domain/conversation/conversation_title";


export type ConversationDTO = {
    id: string,
    conversationType: string,
    title: string,
    avatarId: string | null,
    createdBy: string,
    createdAt: string,
    lastMessageAt: string | null,
    userLow: string | null,
    userHigh: string | null,
    lastMessageContent?: string,
    lastMessageSenderId?: string,
    unreadCount: number,
}