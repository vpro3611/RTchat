import {ConversationBans} from "../conversation_bans/conversation_bans";


export interface ConversationBansInterface {
    isBanned(conversationId: string, userId: string): Promise<boolean>;
    ban(convBan: ConversationBans): Promise<void>;
    unban(conversationId: string, userId: string): Promise<void>;
    getBannedUsers(conversationId: string): Promise<ConversationBans[]>;
}