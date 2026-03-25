

export type ConversationBans = {
    conversationId: string,
    userId: string,
    bannedBy: string,
    createdAt: Date,
    reason: string,
}