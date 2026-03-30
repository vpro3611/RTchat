"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_1 = require("../../../../src/modules/chat/domain/conversation/conversation");
const conversation_type_1 = require("../../../../src/modules/chat/domain/conversation/conversation_type");
const conversation_title_1 = require("../../../../src/modules/chat/domain/conversation/conversation_title");
const conversation_errors_1 = require("../../../../src/modules/chat/errors/conversation_errors/conversation_errors");
describe("Conversation Domain", () => {
    const USER_A = "11111111-1111-1111-1111-111111111111";
    const USER_B = "22222222-2222-2222-2222-222222222222";
    // =========================
    // createDirect
    // =========================
    it("should create direct conversation", () => {
        const conversation = conversation_1.Conversation.createDirect(USER_A, USER_A, USER_B);
        expect(conversation.getConversationType())
            .toBe(conversation_type_1.ConversationType.DIRECT);
        expect(conversation.getUserLow())
            .toBe(USER_A);
        expect(conversation.getUserHigh())
            .toBe(USER_B);
        expect(conversation.getLastMessageAt())
            .toBeNull();
    });
    it("should sort users in direct conversation", () => {
        const conversation = conversation_1.Conversation.createDirect(USER_A, USER_B, USER_A);
        expect(conversation.getUserLow())
            .toBe(USER_A);
        expect(conversation.getUserHigh())
            .toBe(USER_B);
    });
    // =========================
    // createGroup
    // =========================
    it("should create group conversation", () => {
        const title = conversation_title_1.ConversationTitle.create("Group Chat");
        const conversation = conversation_1.Conversation.createGroup(title, USER_A);
        expect(conversation.getConversationType())
            .toBe(conversation_type_1.ConversationType.GROUP);
        expect(conversation.getTitle().getValue())
            .toBe("Group Chat");
        expect(conversation.getUserLow())
            .toBeNull();
        expect(conversation.getUserHigh())
            .toBeNull();
    });
    // =========================
    // restore
    // =========================
    it("should restore direct conversation", () => {
        const now = new Date();
        const conversation = conversation_1.Conversation.restore(crypto.randomUUID(), conversation_type_1.ConversationType.DIRECT, "", USER_A, now, null, USER_A, USER_B);
        expect(conversation.getConversationType())
            .toBe(conversation_type_1.ConversationType.DIRECT);
        expect(conversation.getUserLow())
            .toBe(USER_A);
        expect(conversation.getUserHigh())
            .toBe(USER_B);
    });
    it("should restore group conversation", () => {
        const now = new Date();
        const conversation = conversation_1.Conversation.restore(crypto.randomUUID(), conversation_type_1.ConversationType.GROUP, "My Group", USER_A, now, null, null, null);
        expect(conversation.getTitle().getValue())
            .toBe("My Group");
    });
    // =========================
    // invariants
    // =========================
    it("should throw if direct conversation has no users", () => {
        expect(() => conversation_1.Conversation.restore(crypto.randomUUID(), conversation_type_1.ConversationType.DIRECT, "", USER_A, new Date(), null, null, null)).toThrow(conversation_errors_1.DirectConversationTwoUsersError);
    });
    // =========================
    // updateTitle
    // =========================
    it("should update title for group conversation", () => {
        const conversation = conversation_1.Conversation.createGroup(conversation_title_1.ConversationTitle.create("Old Title"), USER_A);
        conversation.updateTitle("New Title");
        expect(conversation.getTitle().getValue())
            .toBe("New Title");
    });
    it("should throw when updating title for direct conversation", () => {
        const conversation = conversation_1.Conversation.createDirect(USER_A, USER_A, USER_B);
        expect(() => conversation.updateTitle("New Title")).toThrow(conversation_errors_1.CannotUpdateTitleError);
    });
    // =========================
    // updateLastMessageAt
    // =========================
    it("should update last message date", () => {
        const conversation = conversation_1.Conversation.createDirect(USER_A, USER_A, USER_B);
        const date = new Date();
        conversation.updateLastMessageAt(date);
        expect(conversation.getLastMessageAt())
            .toEqual(date);
    });
});
