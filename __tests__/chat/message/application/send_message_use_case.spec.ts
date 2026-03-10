import { SendMessageUseCase } from "../../../../src/modules/chat/application/message/send_message_use_case";
import { UserIsNotAllowedToPerformError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";

describe("SendMessageUseCase", () => {

    let messageRepo: any;
    let conversationRepo: any;
    let mapper: any;
    let checkIsParticipant: any;
    let cacheService: any;
    let participantRepo: any;

    let useCase: SendMessageUseCase;

    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";

    beforeEach(() => {

        messageRepo = {
            create: jest.fn()
        };

        conversationRepo = {
            updateLastMessage: jest.fn()
        };

        mapper = {
            mapToMessage: jest.fn()
        };

        checkIsParticipant = {
            checkIsParticipant: jest.fn()
        };

        cacheService = {
            delByPattern: jest.fn()
        };

        participantRepo = {
            getParticipants: jest.fn()
        };

        useCase = new SendMessageUseCase(
            messageRepo,
            conversationRepo,
            mapper,
            checkIsParticipant,
            cacheService,
            participantRepo
        );

    });

    // =========================
    // cannot send messages
    // =========================

    it("should throw if participant cannot send messages", async () => {

        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getCanSendMessages: () => false
        });

        await expect(
            useCase.sendMessageUseCase(
                USER_ID,
                CONVERSATION_ID,
                "hello"
            )
        ).rejects.toBeInstanceOf(UserIsNotAllowedToPerformError);

    });

    // =========================
    // happy path
    // =========================

    it("should send message successfully", async () => {

        const participant = {
            getCanSendMessages: () => true
        };

        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);

        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: "user-1" },
                { userId: "user-2" }
            ]
        });

        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });

        const result = await useCase.sendMessageUseCase(
            USER_ID,
            CONVERSATION_ID,
            "hello world"
        );

        expect(messageRepo.create).toHaveBeenCalled();

        expect(conversationRepo.updateLastMessage)
            .toHaveBeenCalledWith(
                CONVERSATION_ID,
                expect.any(Date)
            );

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`messages:${CONVERSATION_ID}:*`);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:user-1:*`);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:user-2:*`);

        expect(result).toEqual({ id: "msg-1" });

    });

});