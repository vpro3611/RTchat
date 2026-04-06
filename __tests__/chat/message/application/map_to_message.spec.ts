import { Message } from "../../../../src/modules/chat/domain/message/message";
import { Content } from "../../../../src/modules/chat/domain/message/content";
import { MapToMessage } from "../../../../src/modules/chat/shared/map_to_message";
import { Attachment } from "../../../../src/modules/chat/domain/message/attachment";

describe("MapToMessage", () => {
    const mapper = new MapToMessage();

    it("should map a regular message correctly", () => {
        const message = Message.create(
            "conv-1",
            "user-1",
            Content.create("Hello")
        );

        const dto = mapper.mapToMessage(message);

        expect(dto.id).toBe(message.id);
        expect(dto.conversationId).toBe(message.getConversationId());
        expect(dto.senderId).toBe(message.getSenderId());
        expect(dto.content).toBe(message.getContent().getContentValue());
        expect(dto.isResent).toBe(false);
        expect(dto.originalSenderId).toBeUndefined();
    });

    it("should map a resent message correctly", () => {
        const message = Message.createResent(
            "conv-2",
            "user-2",
            Content.create("Resent content"),
            "original-user-1"
        );

        const dto = mapper.mapToMessage(message);

        expect(dto.id).toBe(message.id);
        expect(dto.isResent).toBe(true);
        expect(dto.originalSenderId).toBe("original-user-1");
    });

    it("should map a message with voice attachment correctly", () => {
        const voiceAttachment = Attachment.create(
            "blob-voice",
            "voice",
            "voice.mp3",
            "audio/mp3",
            500,
            30
        );
        const message = Message.create(
            "conv-1",
            "user-1",
            Content.create("Voice message"),
            [voiceAttachment]
        );

        const dto = mapper.mapToMessage(message);

        expect(dto.attachments).toHaveLength(1);
        expect(dto.attachments[0].type).toBe("voice");
        expect(dto.attachments[0].duration).toBe(30);
    });
});
