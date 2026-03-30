"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const conversation_type_1 = require("./conversation_type");
const conversation_title_1 = require("./conversation_title");
const conversation_errors_1 = require("../../errors/conversation_errors/conversation_errors");
class Conversation {
    id;
    conversationType;
    title;
    createdBy;
    createdAt;
    lastMessageAt;
    userLow;
    userHigh;
    avatarId;
    constructor(id, conversationType, title, createdBy, createdAt, lastMessageAt, userLow, userHigh, avatarId = null) {
        this.id = id;
        this.conversationType = conversationType;
        this.title = title;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.lastMessageAt = lastMessageAt;
        this.userLow = userLow;
        this.userHigh = userHigh;
        this.avatarId = avatarId;
        if (conversationType === conversation_type_1.ConversationType.DIRECT && (!userLow || !userHigh)) {
            throw new conversation_errors_1.DirectConversationTwoUsersError("Direct conversation must have two users!");
        }
    }
    static restore(id, conversationType, title, createdBy, createdAt, lastMessageAt, userLow, userHigh, avatarId = null) {
        return new Conversation(id, conversationType, title === "" ? conversation_title_1.ConversationTitle.empty() : conversation_title_1.ConversationTitle.create(title), createdBy, createdAt, lastMessageAt, userLow, userHigh, avatarId);
    }
    static createDirect(createdBy, userA, userB) {
        const [userLow, userHigh] = userA < userB ? [userA, userB] : [userB, userA];
        return new Conversation(crypto.randomUUID(), conversation_type_1.ConversationType.DIRECT, conversation_title_1.ConversationTitle.empty(), createdBy, new Date(), null, userLow, userHigh, null);
    }
    static createGroup(title, createdBy) {
        return new Conversation(crypto.randomUUID(), conversation_type_1.ConversationType.GROUP, title, createdBy, new Date(), null, null, null, null);
    }
    updateTitle(newTitle) {
        if (this.conversationType === conversation_type_1.ConversationType.DIRECT) {
            throw new conversation_errors_1.CannotUpdateTitleError("Direct conversation cannot have a title!");
        }
        const checkedTitle = conversation_title_1.ConversationTitle.create(newTitle);
        this.setTitle(checkedTitle);
    }
    updateLastMessageAt(date) {
        this.setLastMessageAt(date);
    }
    setTitle(title) {
        this.title = title;
    }
    setLastMessageAt(date) {
        this.lastMessageAt = date;
    }
    getConversationType = () => this.conversationType;
    getTitle = () => this.title;
    getCreatedBy = () => this.createdBy;
    getCreatedAt = () => this.createdAt;
    getLastMessageAt = () => this.lastMessageAt;
    getUserLow = () => this.userLow;
    getUserHigh = () => this.userHigh;
    getAvatarId = () => this.avatarId;
}
exports.Conversation = Conversation;
