"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_direct_conversation_use_case_1 = require("../../../../src/modules/chat/application/conversation/create_direct_conversation_use_case");
const conversation_errors_1 = require("../../../../src/modules/chat/errors/conversation_errors/conversation_errors");
const conversation_1 = require("../../../../src/modules/chat/domain/conversation/conversation");
describe("CreateDirectConversationUseCase", () => {
    let conversationRepo;
    let participantRepo;
    let mapper;
    let cacheService;
    let userToUserBansRepo;
    let useCase;
    const USER_A = "user-a";
    const USER_B = "user-b";
    beforeEach(() => {
        conversationRepo = {
            findDirectConversation: jest.fn(),
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
        userToUserBansRepo = {
            ensureAnyBlocksExists: jest.fn()
        };
        useCase = new create_direct_conversation_use_case_1.CreateDirectConversationUseCase(conversationRepo, participantRepo, mapper, cacheService, userToUserBansRepo);
    });
    // =========================
    // self conversation
    // =========================
    it("should throw if actor tries to create conversation with himself", async () => {
        await expect(useCase.createDirectConversationUseCase(USER_A, USER_A)).rejects.toBeInstanceOf(conversation_errors_1.CannotCreateConversationError);
    });
    // =========================
    // existing conversation
    // =========================
    it("should return existing conversation if found", async () => {
        const conversation = conversation_1.Conversation.createDirect(USER_A, USER_A, USER_B);
        const dto = { id: conversation.id };
        conversationRepo.findDirectConversation.mockResolvedValue(conversation);
        mapper.mapToConversationDto.mockReturnValue(dto);
        const result = await useCase.createDirectConversationUseCase(USER_A, USER_B);
        expect(conversationRepo.findDirectConversation)
            .toHaveBeenCalledWith(USER_A, USER_B);
        expect(conversationRepo.create).not.toHaveBeenCalled();
        expect(result).toEqual(dto);
    });
    // =========================
    // create new conversation
    // =========================
    it("should create new conversation when none exists", async () => {
        conversationRepo.findDirectConversation.mockResolvedValue(null);
        const dto = { id: "conv-id" };
        mapper.mapToConversationDto.mockReturnValue(dto);
        const result = await useCase.createDirectConversationUseCase(USER_A, USER_B);
        expect(conversationRepo.create).toHaveBeenCalled();
        expect(participantRepo.save).toHaveBeenCalledTimes(2);
        expect(result).toEqual(dto);
    });
    // =========================
    // cache invalidation
    // =========================
    it("should invalidate cache for both users", async () => {
        conversationRepo.findDirectConversation.mockResolvedValue(null);
        mapper.mapToConversationDto.mockReturnValue({});
        await useCase.createDirectConversationUseCase(USER_A, USER_B);
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_A}:*`);
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_B}:*`);
    });
    // =========================
    // participant creation
    // =========================
    it("should create participants for both users", async () => {
        conversationRepo.findDirectConversation.mockResolvedValue(null);
        mapper.mapToConversationDto.mockReturnValue({});
        await useCase.createDirectConversationUseCase(USER_A, USER_B);
        expect(participantRepo.save).toHaveBeenCalledTimes(2);
    });
    // =========================
    // blocking relations
    // =========================
    it("should throw if actor is blocked by target", async () => {
        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(true);
        await expect(useCase.createDirectConversationUseCase(USER_A, USER_B)).rejects.toBeInstanceOf(conversation_errors_1.CannotCreateConversationError);
        expect(userToUserBansRepo.ensureAnyBlocksExists)
            .toHaveBeenCalledWith(USER_A, USER_B);
    });
    it("should throw if actor blocked target", async () => {
        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(true);
        await expect(useCase.createDirectConversationUseCase(USER_A, USER_B)).rejects.toBeInstanceOf(conversation_errors_1.CannotCreateConversationError);
    });
    it("should allow conversation if no blocking relations", async () => {
        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(false);
        conversationRepo.findDirectConversation.mockResolvedValue(null);
        mapper.mapToConversationDto.mockReturnValue({});
        const result = await useCase.createDirectConversationUseCase(USER_A, USER_B);
        expect(result).toEqual({});
    });
});
