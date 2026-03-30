"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedMessages = void 0;
class SavedMessages {
    savedBy;
    messageId;
    conversationId;
    senderId;
    content;
    createdAt;
    updatedAt;
    constructor(savedBy, messageId, conversationId, senderId, content, createdAt, updatedAt) {
        this.savedBy = savedBy;
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(savedBy, messageId, conversationId, senderId, content, createdAt, updatedAt) {
        return new SavedMessages(savedBy, messageId, conversationId, senderId, content, createdAt, updatedAt);
    }
    static restore(savedBy, messageId, conversationId, senderId, content, createdAt, updatedAt) {
        return new SavedMessages(savedBy, messageId, conversationId, senderId, content, createdAt, updatedAt);
    }
    getSavedBy = () => this.savedBy;
    getMessageId = () => this.messageId;
    getConversationId = () => this.conversationId;
    getSenderId = () => this.senderId;
    getContent = () => this.content;
    getCreatedAt = () => this.createdAt;
    getUpdatedAt = () => this.updatedAt;
}
exports.SavedMessages = SavedMessages;
