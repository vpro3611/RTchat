import {Conversation} from "../conversation/conversation";

export interface ConversationRepoInterface {
    create(conversation: Conversation): Promise<void>;
    update(conversation: Conversation): Promise<void>;
    findById(id: string): Promise<Conversation | null>;
    findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null>;
    getUserConversations(userId: string, limit?: number, cursor?: string): Promise<{items: Conversation[], nextCursor?: string}>;
    updateLastMessage(conversationId: string, date: Date): Promise<void>;
    markRead(conversationId: string, userId: string, messageId: string): Promise<void>;
    searchConversations(query: string, limit?: number, cursor?: string): Promise<{items: Conversation[], nextCursor?: string}>;
}



