"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("../../../../src/modules/chat/domain/message/message");
const content_1 = require("../../../../src/modules/chat/domain/message/content");
const message_errors_1 = require("../../../../src/modules/chat/errors/message_errors/message_errors");
describe("Message Domain", () => {
    const CONVERSATION_ID = "conv-1";
    const USER_ID = "user-1";
    // =========================
    // create
    // =========================
    it("should create message", () => {
        const content = content_1.Content.create("Hello");
        const message = message_1.Message.create(CONVERSATION_ID, USER_ID, content);
        expect(message.getConversationId())
            .toBe(CONVERSATION_ID);
        expect(message.getSenderId())
            .toBe(USER_ID);
        expect(message.getContent().getContentValue())
            .toBe("Hello");
        expect(message.getIsEdited())
            .toBe(false);
        expect(message.getIsDeleted())
            .toBe(false);
        expect(message.getCreatedAt())
            .toBeInstanceOf(Date);
    });
    // =========================
    // restore
    // =========================
    it("should restore message", () => {
        const now = new Date();
        const message = message_1.Message.restore("msg-id", CONVERSATION_ID, USER_ID, "Hello", true, false, now, now);
        expect(message.id).toBe("msg-id");
        expect(message.getContent().getContentValue())
            .toBe("Hello");
        expect(message.getIsEdited())
            .toBe(true);
    });
    // =========================
    // edit message
    // =========================
    it("should edit message", () => {
        const message = message_1.Message.create(CONVERSATION_ID, USER_ID, content_1.Content.create("Old message"));
        message.editMessage("New message");
        expect(message.getContent().getContentValue())
            .toBe("New message");
        expect(message.getIsEdited())
            .toBe(true);
    });
    it("should update updatedAt when editing", () => {
        const message = message_1.Message.create(CONVERSATION_ID, USER_ID, content_1.Content.create("Hello"));
        const oldDate = message.getUpdatedAt();
        message.editMessage("Updated");
        expect(message.getUpdatedAt().getTime())
            .toBeGreaterThanOrEqual(oldDate.getTime());
    });
    it("should throw if editing deleted message", () => {
        const message = message_1.Message.create(CONVERSATION_ID, USER_ID, content_1.Content.create("Hello"));
        message.deleteMessage();
        expect(() => message.editMessage("New")).toThrow(message_errors_1.CannotEditMessageError);
    });
    // =========================
    // delete message
    // =========================
    it("should delete message", () => {
        const message = message_1.Message.create(CONVERSATION_ID, USER_ID, content_1.Content.create("Hello"));
        message.deleteMessage();
        expect(message.getIsDeleted())
            .toBe(true);
    });
    it("should update updatedAt when deleting", () => {
        const message = message_1.Message.create(CONVERSATION_ID, USER_ID, content_1.Content.create("Hello"));
        const oldDate = message.getUpdatedAt();
        message.deleteMessage();
        expect(message.getUpdatedAt().getTime())
            .toBeGreaterThanOrEqual(oldDate.getTime());
    });
    it("should throw when deleting already deleted message", () => {
        const message = message_1.Message.create(CONVERSATION_ID, USER_ID, content_1.Content.create("Hello"));
        message.deleteMessage();
        expect(() => message.deleteMessage()).toThrow(message_errors_1.CannotEditMessageError);
    });
});
