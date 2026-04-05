import { Message, ReplyMetadata } from "../../../../src/modules/chat/domain/message/message";
import { Content } from "../../../../src/modules/chat/domain/message/content";

describe('Message Domain Entity', () => {
    it('should allow creating a message with reply metadata', () => {
        const replyMetadata: ReplyMetadata = {
            parentMessageId: 'parent-id',
            parentContentSnippet: 'Hello world',
            parentSenderId: 'sender-id'
        };
        const message = Message.create(
            'conv-id',
            'user-id',
            Content.create('My reply'),
            [],
            replyMetadata
        );
        expect(message.getReplyMetadata()).toEqual(replyMetadata);
    });
});
