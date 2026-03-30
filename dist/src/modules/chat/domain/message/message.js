"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const content_1 = require("./content");
const message_errors_1 = require("../../errors/message_errors/message_errors");
class Message {
    id;
    conversationId;
    senderId;
    content;
    isEdited;
    isDeleted;
    createdAt;
    updatedAt;
    constructor(id, conversationId, senderId, content, isEdited, isDeleted, createdAt, updatedAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.isEdited = isEdited;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static restore(id, conversationId, senderId, content, isEdited, idDeleted, createdAt, updatedAt) {
        return new Message(id, conversationId, senderId, content_1.Content.create(content), isEdited, idDeleted, createdAt, updatedAt);
    }
    static create(conversationId, senderId, content) {
        return new Message(crypto.randomUUID(), conversationId, senderId, content, false, false, new Date(), new Date());
    }
    editMessage(newContent) {
        if (this.isDeleted) {
            throw new message_errors_1.CannotEditMessageError('Cannot edit a deleted message');
        }
        const evaluated = content_1.Content.create(newContent);
        this.content = evaluated;
        this.setIsEdited(true);
        this.setUpdatedAt(new Date());
    }
    deleteMessage() {
        if (this.isDeleted) {
            throw new message_errors_1.CannotEditMessageError('Message already deleted');
        }
        this.setIsDeleted(true);
        this.setUpdatedAt(new Date());
    }
    setUpdatedAt(date) {
        this.updatedAt = date;
    }
    setIsEdited(isEdited) {
        this.isEdited = isEdited;
    }
    setIsDeleted(isDeleted) {
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
exports.Message = Message;
