
import { ResendMessageUseCase } from "../../../src/modules/chat/application/message/resend_message_use_case";
import { Message } from "../../../src/modules/chat/domain/message/message";
import { Content } from "../../../src/modules/chat/domain/message/content";
import { UserIsNotAllowedToPerformError } from "../../../src/modules/chat/errors/participants_errors/participant_errors";
import { MessageNotAPartOfConversationError } from "../../../src/modules/chat/errors/message_errors/message_errors";
import { CannotCreateConversationError } from "../../../src/modules/chat/errors/conversation_errors/conversation_errors";
import { ValidationError } from "../../../src/http_errors_base";

describe("ResendMessageUseCase", () => {
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
        conversationRepo = { findById: jest.fn(), updateLastMessage: jest.fn() };
        messageMapper = { mapToMessage: jest.fn(m => m) };
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

    const mockMessage = Message.restore(
        messageId,
        sourceConvId,
        "original-sender",
        "Hello world",
        false,
        false,
        new Date(),
        new Date(),
        undefined,
        false
    );

    it("should successfully resend a message", async () => {
        findMessageById.findMessageById.mockResolvedValue(mockMessage);
        checkIsParticipant.checkIsParticipant.mockResolvedValue({ getCanSendMessages: () => true });
        conversationRepo.findById.mockResolvedValue({ getConversationType: () => "group" });
        conversationBansRepo.isBanned.mockResolvedValue(null);
        participantRepo.getParticipants.mockResolvedValue({ 
            items: [{ userId: "user-1" }, { userId: "user-2" }] 
        });

        const result = await useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId);

        expect(messageRepo.create).toHaveBeenCalled();
        expect(conversationRepo.updateLastMessage).toHaveBeenCalledWith(targetConvId, expect.any(Date));
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`messages:${targetConvId}:*`);
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`conv:user:user-1:*`);
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`conv:user:user-2:*`);
        expect(result.isResent).toBe(true);
        expect(result.originalSenderId).toBe("original-sender");
    });

    it("should throw if message does not belong to source conversation", async () => {
        const wrongConvMessage = Message.restore(messageId, "wrong-conv", "s", "c", false, false, new Date(), new Date());
        findMessageById.findMessageById.mockResolvedValue(wrongConvMessage);

        await expect(useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId))
            .rejects.toThrow(MessageNotAPartOfConversationError);
    });

    it("should throw if message is deleted", async () => {
        const deletedMessage = Message.restore(messageId, sourceConvId, "s", "c", false, true, new Date(), new Date());
        findMessageById.findMessageById.mockResolvedValue(deletedMessage);

        await expect(useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId))
            .rejects.toThrow(ValidationError);
    });

    it("should throw if user is banned from target group", async () => {
        findMessageById.findMessageById.mockResolvedValue(mockMessage);
        checkIsParticipant.checkIsParticipant.mockResolvedValue({ getCanSendMessages: () => true });
        conversationRepo.findById.mockResolvedValue({ getConversationType: () => "group" });
        conversationBansRepo.isBanned.mockResolvedValue({ id: "ban-id" });

        await expect(useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId))
            .rejects.toThrow(UserIsNotAllowedToPerformError);
    });

    it("should throw if user is not a participant of source conversation", async () => {
        checkIsParticipant.checkIsParticipant.mockImplementationOnce(() => {
            throw new UserIsNotAllowedToPerformError("User is not a participant");
        });

        await expect(useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId))
            .rejects.toThrow(UserIsNotAllowedToPerformError);
    });

    it("should throw if user is not allowed to send messages in target conversation", async () => {
        findMessageById.findMessageById.mockResolvedValue(mockMessage);
        checkIsParticipant.checkIsParticipant
            .mockResolvedValueOnce({ getCanSendMessages: () => true }) // source
            .mockResolvedValueOnce({ getCanSendMessages: () => false }); // target

        await expect(useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId))
            .rejects.toThrow(UserIsNotAllowedToPerformError);
    });

    it("should throw if target conversation is not found", async () => {
        findMessageById.findMessageById.mockResolvedValue(mockMessage);
        checkIsParticipant.checkIsParticipant.mockResolvedValue({ getCanSendMessages: () => true });
        conversationRepo.findById.mockResolvedValue(null);

        await expect(useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId))
            .rejects.toThrow(CannotCreateConversationError);
    });

    it("should throw if there is a blocking relation in a direct conversation", async () => {
        findMessageById.findMessageById.mockResolvedValue(mockMessage);
        checkIsParticipant.checkIsParticipant.mockResolvedValue({ getCanSendMessages: () => true });
        conversationRepo.findById.mockResolvedValue({ getConversationType: () => "direct" });
        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: actorId },
                { userId: "target-user" }
            ]
        });
        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue({ id: "block-id" });

        await expect(useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId))
            .rejects.toThrow(UserIsNotAllowedToPerformError);
    });

    it("should correctly handle resending with original sender preserving", async () => {
        const resentMessage = Message.restore(
            messageId,
            sourceConvId,
            "intermediate-sender",
            "Hello world",
            false,
            false,
            new Date(),
            new Date(),
            "truly-original-sender",
            true
        );
        findMessageById.findMessageById.mockResolvedValue(resentMessage);
        checkIsParticipant.checkIsParticipant.mockResolvedValue({ getCanSendMessages: () => true });
        conversationRepo.findById.mockResolvedValue({ getConversationType: () => "group" });
        conversationBansRepo.isBanned.mockResolvedValue(null);
        participantRepo.getParticipants.mockResolvedValue({ items: [] });

        await useCase.resendMessageUseCase(actorId, messageId, sourceConvId, targetConvId);

        expect(messageRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                originalSenderId: "truly-original-sender"
            })
        );
    });
});
