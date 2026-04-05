export interface MessageReplyRepoInterface {
    create(data: {
        messageId: string,
        parentMessageId: string,
        parentContentSnippet: string,
        parentSenderId: string,
        conversationId: string,
        repliedBy: string
    }): Promise<void>;
}
