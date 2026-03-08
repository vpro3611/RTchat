import {ConversationType} from "../domain/conversation/conversation_type";
import {ConversationTitle} from "../domain/conversation/conversation_title";


export type ConversationDTO = {
    id: string,
    conversationType: string,
    title: string,
    createdBy: string,
    createdAt: string,
    lastMessageAt: string | null,
    userLow: string | null,
    userHigh: string | null,
    // public readonly id: string,
    // private conversationType: ConversationType,
    // private title: ConversationTitle,
    // private createdBy: string,
    // private createdAt: Date,
    // private lastMessageAt: Date | null,
    // private userLow: string | null,
    // private userHigh: string | null,
}