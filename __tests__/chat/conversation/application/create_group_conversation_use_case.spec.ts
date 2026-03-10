import { CreateGroupConversationUseCase } from "../../../../src/modules/chat/application/conversation/create_group_conversation_use_case";
import { Conversation } from "../../../../src/modules/chat/domain/conversation/conversation";
import { Participant } from "../../../../src/modules/chat/domain/participant/participant";

describe("CreateGroupConversationUseCase", () => {

    let conversationRepo: any;
    let participantRepo: any;
    let mapper: any;
    let cacheService: any;

    let useCase: CreateGroupConversationUseCase;

    const USER_ID = "user-a";

    beforeEach(() => {

        conversationRepo = {
            create: jest.fn()
        };

        participantRepo = {
            save: jest.fn()
        };

        mapper = {
            mapToConversationDto: jest.fn()
        };

        cacheService = {
            delByPattern: jest.fn()
        };

        useCase = new CreateGroupConversationUseCase(
            conversationRepo,
            participantRepo,
            mapper,
            cacheService
        );
    });

    // =========================
    // happy path
    // =========================

    it("should create group conversation", async () => {

        const dto = { id: "conv-id" };

        mapper.mapToConversationDto.mockReturnValue(dto);

        const result = await useCase.createGroupConversationUseCase(
            "My group",
            USER_ID
        );

        expect(conversationRepo.create).toHaveBeenCalled();

        expect(participantRepo.save).toHaveBeenCalledTimes(1);

        expect(result).toEqual(dto);

    });

    // =========================
    // owner creation
    // =========================

    it("should create owner participant", async () => {

        mapper.mapToConversationDto.mockReturnValue({});

        await useCase.createGroupConversationUseCase(
            "Group",
            USER_ID
        );

        expect(participantRepo.save).toHaveBeenCalled();

        const savedParticipant = participantRepo.save.mock.calls[0][0];

        expect(savedParticipant.userId).toBe(USER_ID);

    });

    // =========================
    // cache invalidation
    // =========================

    it("should invalidate cache for actor", async () => {

        mapper.mapToConversationDto.mockReturnValue({});

        await useCase.createGroupConversationUseCase(
            "Group",
            USER_ID
        );

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_ID}:*`);

    });

    // =========================
    // mapper
    // =========================

    it("should map conversation to dto", async () => {

        const dto = { id: "dto-id" };

        mapper.mapToConversationDto.mockReturnValue(dto);

        const result = await useCase.createGroupConversationUseCase(
            "Group",
            USER_ID
        );

        expect(mapper.mapToConversationDto)
            .toHaveBeenCalled();

        expect(result).toEqual(dto);

    });

    // =========================
    // title validation
    // =========================

    it("should throw if title invalid", async () => {

        await expect(
            useCase.createGroupConversationUseCase(
                "",
                USER_ID
            )
        ).rejects.toThrow();

    });

});