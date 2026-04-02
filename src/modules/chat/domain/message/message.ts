import {Content} from "./content";
import {CannotEditMessageError} from "../../errors/message_errors/message_errors";
import {Attachment} from "./attachment";


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
        private readonly originalSenderId?: string,
        private readonly isResent: boolean = false,
        private readonly attachments: Attachment[] = []
    ) {}

    static restore(
        id: string,
        conversationId: string,
        senderId: string,
        content: string,
        isEdited: boolean,
        isDeleted: boolean,
        createdAt: Date,
        updatedAt: Date,
        originalSenderId?: string,
        isResent: boolean = false,
        attachments: Attachment[] = []
    ) {
        return new Message(
            id,
            conversationId,
            senderId,
            Content.create(content),
            isEdited,
            isDeleted,
            createdAt,
            updatedAt,
            originalSenderId,
            isResent,
            attachments
        );
    }

    static create(
        conversationId: string,
        senderId: string,
        content: Content,
        attachments: Attachment[] = []
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
            undefined,
            false,
            attachments
        );
    }

    static createResent(
        targetConversationId: string,
        actorId: string,
        content: Content,
        originalSenderId: string,
        attachments: Attachment[] = []
    ) {
        return new Message(
            crypto.randomUUID(),
            targetConversationId,
            actorId,
            content,
            false,
            false,
            new Date(),
            new Date(),
            originalSenderId,
            true,
            attachments
        );
    }

    editMessage(newContent: string) {
        if (this.isDeleted) {
            throw new CannotEditMessageError('Cannot edit a deleted message');
        }
        const evaluated = Content.create(newContent);
        this.content = evaluated;
        this.setIsEdited(true);
        this.setUpdatedAt(new Date());
    }

    deleteMessage() {
        if (this.isDeleted) {
            throw new CannotEditMessageError('Message already deleted');
        }
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
    getAttachments = () => this.attachments;
    getIsEdited = () => this.isEdited;
    getIsDeleted = () => this.isDeleted;
    getCreatedAt = () => this.createdAt;
    getUpdatedAt = () => this.updatedAt;
    getOriginalSenderId = () => this.originalSenderId;
    getIsResent = () => this.isResent;
}