import {Message} from "../message/message";


export interface MessageRepoInterface {
    create(message: Message): Promise<void>;
    update(message: Message): Promise<void>;
    findByConversationId(conversationId: string, limit?: number, cursor?: string): Promise<{items: Message[], nextCursor?: string}>;
    findById(id: string): Promise<Message | null>;
}
