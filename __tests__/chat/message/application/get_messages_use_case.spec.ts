import { GetMessagesUseCase } from "../../../../src/modules/chat/application/message/get_messages_use_case";
import { ActorIsNotParticipantError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";

describe("GetMessagesUseCase", () => {

    let messageRepo: any;
    let mapper: any;
    let cacheService: any;
    let participantRepo: any;
    let conversationRepo: any;

    let useCase: GetMessagesUseCase;

    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";

    beforeEach(() => {

        messageRepo = {
            findByConversationId: jest.fn()
        };

        mapper = {
            mapToMessage: jest.fn()
        };

        cacheService = {
            remember: jest.fn()
        };

        participantRepo = {
            exists: jest.fn()
        };

        conversationRepo = {
            getMaxReadAtForOthers: jest.fn()
        };

        useCase = new GetMessagesUseCase(
            messageRepo,
            mapper,
            cacheService,
            participantRepo,
            conversationRepo
        );

    });

    // =========================
    // actor not participant
    // =========================

    it("should throw if actor is not participant", async () => {

        participantRepo.exists.mockResolvedValue(false);

        await expect(
            useCase.getMessagesUseCase(
                USER_ID,
                CONVERSATION_ID
            )
        ).rejects.toBeInstanceOf(ActorIsNotParticipantError);

    });

    // =========================
    // cache key default values
    // =========================

    it("should use default limit and cursor", async () => {

        participantRepo.exists.mockResolvedValue(true);

        cacheService.remember.mockImplementation(
            async (_key: string, _ttl: number, callback: any) => callback()
        );

        messageRepo.findByConversationId.mockResolvedValue({
            items: [],
            nextCursor: undefined
        });

        await useCase.getMessagesUseCase(
            USER_ID,
            CONVERSATION_ID
        );

        expect(cacheService.remember).toHaveBeenCalledWith(
            `messages:${CONVERSATION_ID}:limit:20:cursor:start`,
            60,
            expect.any(Function)
        );

    });

    // =========================
    // repo call
    // =========================

    it("should call repository inside cache callback", async () => {

        participantRepo.exists.mockResolvedValue(true);

        cacheService.remember.mockImplementation(
            async (_key: string, _ttl: number, callback: any) => callback()
        );

        messageRepo.findByConversationId.mockResolvedValue({
            items: [],
            nextCursor: undefined
        });

        await useCase.getMessagesUseCase(
            USER_ID,
            CONVERSATION_ID,
            10,
            "cursor123"
        );

        expect(messageRepo.findByConversationId)
            .toHaveBeenCalledWith(CONVERSATION_ID, 10, "cursor123");

    });

    // =========================
    // mapping
    // =========================

    it("should map messages to dto", async () => {

        participantRepo.exists.mockResolvedValue(true);

        const messages = [
            { id: "msg1" },
            { id: "msg2" }
        ];

        messageRepo.findByConversationId.mockResolvedValue({
            items: messages,
            nextCursor: "cursor"
        });

        mapper.mapToMessage
            .mockReturnValueOnce({ id: "msg1" })
            .mockReturnValueOnce({ id: "msg2" });

        cacheService.remember.mockImplementation(
            async (_key: string, _ttl: number, callback: any) => callback()
        );

        const result = await useCase.getMessagesUseCase(
            USER_ID,
            CONVERSATION_ID
        );

        expect(mapper.mapToMessage).toHaveBeenCalledTimes(2);

        expect(result.items).toEqual([
            { id: "msg1" },
            { id: "msg2" }
        ]);

        expect(result.nextCursor).toBe("cursor");

    });

});