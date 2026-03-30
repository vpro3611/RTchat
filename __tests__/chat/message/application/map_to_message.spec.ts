import { Message } from "../../../../src/modules/chat/domain/message/message";
import { Content } from "../../../../src/modules/chat/domain/message/content";
import { MapToMessage } from "../../../../src/modules/chat/shared/map_to_message";

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
});
