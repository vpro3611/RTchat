import { Message } from "../../../../src/modules/chat/domain/message/message";
import { Content } from "../../../../src/modules/chat/domain/message/content";
import { CannotEditMessageError } from "../../../../src/modules/chat/errors/message_errors/message_errors";

describe("Message Domain", () => {

    const CONVERSATION_ID = "conv-1";
    const USER_ID = "user-1";

    // =========================
    // create
    // =========================

    it("should create message", () => {

        const content = Content.create("Hello");

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            content
        );

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

        const message = Message.restore(
            "msg-id",
            CONVERSATION_ID,
            USER_ID,
            "Hello",
            true,
            false,
            now,
            now
        );

        expect(message.id).toBe("msg-id");

        expect(message.getContent().getContentValue())
            .toBe("Hello");

        expect(message.getIsEdited())
            .toBe(true);
    });

    it("should restore a resent message", () => {
        const now = new Date();
        const originalSenderId = "original-sender-1";

        const message = Message.restore(
            "msg-id",
            CONVERSATION_ID,
            USER_ID,
            "Hello",
            false,
            false,
            now,
            now,
            originalSenderId,
            true
        );

        expect(message.getOriginalSenderId()).toBe(originalSenderId);
        expect(message.getIsResent()).toBe(true);
    });

    // =========================
    // createResent
    // =========================

    it("should create a resent message", () => {
        const content = Content.create("Resent content");
        const actorId = "actor-1";
        const originalSenderId = "original-sender-1";
        const targetConversationId = "target-conv-1";

        const message = Message.createResent(
            targetConversationId,
            actorId,
            content,
            originalSenderId
        );

        expect(message.getConversationId()).toBe(targetConversationId);
        expect(message.getSenderId()).toBe(actorId);
        expect(message.getContent().getContentValue()).toBe("Resent content");
        expect(message.getOriginalSenderId()).toBe(originalSenderId);
        expect(message.getIsResent()).toBe(true);
        expect(message.getIsEdited()).toBe(false);
        expect(message.getIsDeleted()).toBe(false);
    });

    // =========================
    // edit message
    // =========================

    it("should edit message", () => {

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create("Old message")
        );

        message.editMessage("New message");

        expect(message.getContent().getContentValue())
            .toBe("New message");

        expect(message.getIsEdited())
            .toBe(true);
    });

    it("should update updatedAt when editing", () => {

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create("Hello")
        );

        const oldDate = message.getUpdatedAt();

        message.editMessage("Updated");

        expect(message.getUpdatedAt().getTime())
            .toBeGreaterThanOrEqual(oldDate.getTime());
    });

    it("should throw if editing deleted message", () => {

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create("Hello")
        );

        message.deleteMessage();

        expect(() =>
            message.editMessage("New")
        ).toThrow(CannotEditMessageError);
    });

    // =========================
    // delete message
    // =========================

    it("should delete message", () => {

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create("Hello")
        );

        message.deleteMessage();

        expect(message.getIsDeleted())
            .toBe(true);
    });

    it("should update updatedAt when deleting", () => {

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create("Hello")
        );

        const oldDate = message.getUpdatedAt();

        message.deleteMessage();

        expect(message.getUpdatedAt().getTime())
            .toBeGreaterThanOrEqual(oldDate.getTime());
    });

    it("should throw when deleting already deleted message", () => {

        const message = Message.create(
            CONVERSATION_ID,
            USER_ID,
            Content.create("Hello")
        );

        message.deleteMessage();

        expect(() =>
            message.deleteMessage()
        ).toThrow(CannotEditMessageError);
    });

});