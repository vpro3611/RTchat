

export class SavedMessages {
    constructor(
        private readonly savedBy: string,
        private readonly messageId: string,
        private readonly conversationId: string,
        private readonly senderId: string,
        private readonly content: string,
        private readonly createdAt: Date,
        private readonly updatedAt: Date | null,
    ) {}

    static create(
        savedBy: string,
        messageId: string,
        conversationId: string,
        senderId: string,
        content: string,
        createdAt: Date,
        updatedAt: Date | null,
    ) {
        return new SavedMessages(
            savedBy,
            messageId,
            conversationId,
            senderId,
            content,
            createdAt,
            updatedAt,
        )
    }

    static restore(
        savedBy: string,
        messageId: string,
        conversationId: string,
        senderId: string,
        content: string,
        createdAt: Date,
        updatedAt: Date | null,
    ) {
        return new SavedMessages(
            savedBy,
            messageId,
            conversationId,
            senderId,
            content,
            createdAt,
            updatedAt,
        );
    }

    getSavedBy = () => this.savedBy;
    getMessageId = () => this.messageId;
    getConversationId = () => this.conversationId;
    getSenderId = () => this.senderId;
    getContent = () => this.content;
    getCreatedAt = () => this.createdAt;
    getUpdatedAt = () => this.updatedAt;
}