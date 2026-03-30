import { EditMessageUseCase } from "../../../../src/modules/chat/application/message/edit_message_use_case";
import {
    MessageNotAPartOfConversationError
} from "../../../../src/modules/chat/errors/message_errors/message_errors";
import {
    UserIsNotAllowedToPerformError,
    UserIsNotAnAuthorError
} from "../../../../src/modules/chat/errors/participants_errors/participant_errors";

describe("EditMessageUseCase", () => {

    let messageRepo: any;
    let mapper: any;
    let checkIsParticipant: any;
    let findMessageById: any;
    let cacheService: any;

    let useCase: EditMessageUseCase;

    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";
    const MESSAGE_ID = "msg-1";

    beforeEach(() => {

        messageRepo = {
            update: jest.fn()
        };

        mapper = {
            mapToMessage: jest.fn()
        };

        checkIsParticipant = {
            checkIsParticipant: jest.fn()
        };

        findMessageById = {
            findMessageById: jest.fn()
        };

        cacheService = {
            delByPattern: jest.fn()
        };

        useCase = new EditMessageUseCase(
            messageRepo,
            mapper,
            checkIsParticipant,
            findMessageById,
            cacheService
        );
    });

    // =========================
    // cannot send messages
    // =========================

    it("should throw if participant cannot send messages", async () => {

        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            userId: USER_ID,
            getConversationId: () => CONVERSATION_ID,
            getCanSendMessages: () => false
        });

        await expect(
            useCase.editMessageUseCase(
                USER_ID,
                CONVERSATION_ID,
                MESSAGE_ID,
                "new text"
            )
        ).rejects.toBeInstanceOf(UserIsNotAllowedToPerformError);

    });

    // =========================
    // not author
    // =========================

    it("should throw if actor is not message author", async () => {

        const participant = {
            userId: USER_ID,
            getConversationId: () => CONVERSATION_ID,
            getCanSendMessages: () => true
        };

        const message = {
            getSenderId: () => "another-user",
            getConversationId: () => CONVERSATION_ID
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        findMessageById.findMessageById.mockResolvedValue(message);

        await expect(
            useCase.editMessageUseCase(
                USER_ID,
                CONVERSATION_ID,
                MESSAGE_ID,
                "new text"
            )
        ).rejects.toBeInstanceOf(UserIsNotAnAuthorError);

    });

    // =========================
    // message not in conversation
    // =========================

    it("should throw if message not part of conversation", async () => {

        const participant = {
            userId: USER_ID,
            getConversationId: () => CONVERSATION_ID,
            getCanSendMessages: () => true
        };

        const message = {
            getSenderId: () => USER_ID,
            getConversationId: () => "another-conversation"
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        findMessageById.findMessageById.mockResolvedValue(message);

        await expect(
            useCase.editMessageUseCase(
                USER_ID,
                CONVERSATION_ID,
                MESSAGE_ID,
                "new text"
            )
        ).rejects.toBeInstanceOf(MessageNotAPartOfConversationError);

    });

    // =========================
    // happy path
    // =========================

    it("should edit message successfully", async () => {

        const message = {
            getSenderId: () => USER_ID,
            getConversationId: () => CONVERSATION_ID,
            editMessage: jest.fn()
        };

        const participant = {
            userId: USER_ID,
            getConversationId: () => CONVERSATION_ID,
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        findMessageById.findMessageById.mockResolvedValue(message);

        mapper.mapToMessage.mockReturnValue({ id: MESSAGE_ID });

        const result = await useCase.editMessageUseCase(
            USER_ID,
            CONVERSATION_ID,
            MESSAGE_ID,
            "edited text"
        );

        expect(message.editMessage).toHaveBeenCalledWith("edited text");

        expect(messageRepo.update).toHaveBeenCalledWith(message);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`messages:${CONVERSATION_ID}:*`);

        expect(result).toEqual({ id: MESSAGE_ID });

    });

});