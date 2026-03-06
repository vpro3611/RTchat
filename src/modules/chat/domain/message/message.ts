import {Content} from "./content";


export class Message {

    constructor(
        public readonly id: string,
        private readonly conversationId: string,
        private readonly senderId: string,
        private content: Content,
        private isEdited: boolean,
        private isDeleted: boolean,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    static restore(
        id: string,
        conversationId: string,
        senderId: string,
        content: string,
        isEdited: boolean,
        idDeleted: boolean,
        createdAt: Date,
        updatedAt: Date,
    ) {
        return new Message(
            id,
            conversationId,
            senderId,
            Content.create(content),
            isEdited,
            idDeleted,
            createdAt,
            updatedAt,
        );
    }

    static create(
        conversationId: string,
        senderId: string,
        content: Content,
        isEdited: boolean,
        isDeleted: boolean,
        updatedAt: Date,
    ) {
        return new Message(
            crypto.randomUUID(),
            conversationId,
            senderId,
            content,
            false,
            false,
            new Date(),
            new Date(),
        );
    }

    editMessage(newContent: string) {
        if (this.isDeleted) {
            throw new Error('Cannot edit a deleted message');
        }
        const evaluated = Content.create(newContent);
        this.content = evaluated;
        this.setIsEdited(true);
        this.setUpdatedAt(new Date());
    }

    deleteMessage() {
        this.setIsDeleted(true);
        this.setUpdatedAt(new Date());
    }

    private setUpdatedAt(date: Date) {
        this.updatedAt = date;
    }

    private setIsEdited(isEdited: boolean) {
        this.isEdited = isEdited;
    }

    private setIsDeleted(isDeleted: boolean) {
        this.isDeleted = isDeleted;
    }

    getConversationId = () => this.conversationId;
    getSenderId = () => this.senderId;
    getContent = () => this.content;
    getIsEdited = () => this.isEdited;
    getIsDeleted = () => this.isDeleted;
    getCreatedAt = () => this.createdAt;
    getUpdatedAt = () => this.updatedAt;
}