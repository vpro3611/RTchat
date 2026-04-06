
import { ResendMessageUseCase } from "../../../src/modules/chat/application/message/resend_message_use_case";
import { Message } from "../../../src/modules/chat/domain/message/message";
import { Attachment } from "../../../src/modules/chat/domain/message/attachment";
import { MapToMessage } from "../../../src/modules/chat/shared/map_to_message";

describe("ResendMessageUseCase Attachments", () => {
    let messageRepo: any;
    let conversationRepo: any;
    let messageMapper: any;
    let checkIsParticipant: any;
    let findMessageById: any;
    let cacheService: any;
    let participantRepo: any;
    let userToUserBansRepo: any;
    let conversationBansRepo: any;
    let useCase: ResendMessageUseCase;

    const actorId = "user-1";
    const sourceConvId = "conv-source";
    const targetConvId = "conv-target";
    const messageId = "msg-1";

    beforeEach(() => {
        messageRepo = { create: jest.fn() };
        conversationRepo = { 
            findById: jest.fn(), 
            updateLastMessage: jest.fn(),
            getMaxReadAtForOthers: jest.fn()
        };
        messageMapper = { mapToMessage: jest.fn((m, r) => ({ id: m.id, attachments: m.getAttachments() })) };
        checkIsParticipant = { checkIsParticipant: jest.fn() };
        findMessageById = { findMessageById: jest.fn() };
        cacheService = { delByPattern: jest.fn() };
        participantRepo = { getParticipants: jest.fn() };
        userToUserBansRepo = { ensureAnyBlocksExists: jest.fn() };
        conversationBansRepo = { isBanned: jest.fn() };

        useCase = new ResendMessageUseCase(
            messageRepo,
            conversationRepo,
            messageMapper,
            checkIsParticipant,
            findMessageById,
            cacheService,
            participantRepo,
            userToUserBansRepo,
            conversationBansRepo
        );
    });

    it("should copy attachments when resending a message", async () => {
        const attachment1 = Attachment.restore("att-1", "blob-1", "image", "img.png", "image/png", 100, new Date());
        const attachment2 = Attachment.restore("att-2", "blob-2", "voice", "voice.mp3", "audio/mpeg", 200, new Date(), 10);
        
        const mockMessage = Message.restore(
            messageId,
            sourceConvId,
            "sender-1",
            "Message with attachments",
            false,
            false,
            new Date(),
            new Date(),
            undefined,
            false,
            [attachment1, attachment2]
        );

        findMessageById.findMessageById.mockResolvedValue(mockMessage);
        checkIsParticipant.checkIsParticipant.mockResolvedValue({ getCanSendMessages: () => true });
        conversationRepo.findById.mockResolvedValue({ getConversationType: () => "group" });
        conversationBansRepo.isBanned.mockResolvedValue(null);
        participantRepo.getParticipants.mockResolvedValue({ items: [] });
        conversationRepo.getMaxReadAtForOthers.mockResolvedValue(new Date());

        const result = await useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId);

        expect(messageRepo.create).toHaveBeenCalled();
        const createdMessage = messageRepo.create.mock.calls[0][0];
        
        expect(createdMessage.getAttachments()).toHaveLength(2);
        
        const newAtt1 = createdMessage.getAttachments()[0];
        expect(newAtt1.id).not.toBe(attachment1.id);
        expect(newAtt1.blobId).toBe(attachment1.blobId);
        expect(newAtt1.type).toBe(attachment1.type);
        expect(newAtt1.name).toBe(attachment1.name);
        expect(newAtt1.mimeType).toBe(attachment1.mimeType);
        expect(newAtt1.size).toBe(attachment1.size);

        const newAtt2 = createdMessage.getAttachments()[1];
        expect(newAtt2.id).not.toBe(attachment2.id);
        expect(newAtt2.blobId).toBe(attachment2.blobId);
        expect(newAtt2.type).toBe(attachment2.type);
        expect(newAtt2.duration).toBe(attachment2.duration);
    });
});
