"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_user_conversations_use_case_1 = require("../../../../src/modules/chat/application/conversation/get_user_conversations_use_case");
describe("GetUserConversationsUseCase", () => {
    let conversationRepo;
    let mapper;
    let cacheService;
    let useCase;
    const USER_ID = "user-1";
    beforeEach(() => {
        conversationRepo = {
            getUserConversations: jest.fn()
        };
        mapper = {
            mapToConversationDto: jest.fn()
        };
        cacheService = {
            remember: jest.fn()
        };
        useCase = new get_user_conversations_use_case_1.GetUserConversationsUseCase(conversationRepo, mapper, cacheService);
    });
    // =========================
    // happy path
    // =========================
    it("should return mapped conversations", async () => {
        const conversation = { id: "conv1" };
        conversationRepo.getUserConversations.mockResolvedValue({
            items: [conversation],
            nextCursor: "cursor123"
        });
        mapper.mapToConversationDto.mockReturnValue({
            id: "conv1"
        });
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const result = await useCase.getUserConversationsUseCase(USER_ID);
        expect(result.items).toEqual([{ id: "conv1" }]);
        expect(result.nextCursor).toBe("cursor123");
    });
    // =========================
    // cache key
    // =========================
    it("should generate correct cache key", async () => {
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        conversationRepo.getUserConversations.mockResolvedValue({
            items: [],
            nextCursor: undefined
        });
        mapper.mapToConversationDto.mockReturnValue({});
        await useCase.getUserConversationsUseCase(USER_ID, 10, "cursor1");
        const expectedKey = `conv:user:${USER_ID}:limit:10:cursor:cursor1`;
        expect(cacheService.remember).toHaveBeenCalledWith(expectedKey, 60, expect.any(Function));
    });
    // =========================
    // default limit
    // =========================
    it("should use default limit 20 when limit not provided", async () => {
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        conversationRepo.getUserConversations.mockResolvedValue({
            items: [],
            nextCursor: undefined
        });
        mapper.mapToConversationDto.mockReturnValue({});
        await useCase.getUserConversationsUseCase(USER_ID);
        expect(cacheService.remember).toHaveBeenCalledWith(`conv:user:${USER_ID}:limit:20:cursor:start`, 60, expect.any(Function));
    });
    // =========================
    // repo call
    // =========================
    it("should call repository inside cache callback", async () => {
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        conversationRepo.getUserConversations.mockResolvedValue({
            items: [],
            nextCursor: undefined
        });
        mapper.mapToConversationDto.mockReturnValue({});
        await useCase.getUserConversationsUseCase(USER_ID, 5);
        expect(conversationRepo.getUserConversations)
            .toHaveBeenCalledWith(USER_ID, 5, undefined);
    });
    // =========================
    // mapping
    // =========================
    it("should map every conversation to dto", async () => {
        const conversations = [
            { id: "c1" },
            { id: "c2" }
        ];
        conversationRepo.getUserConversations.mockResolvedValue({
            items: conversations,
            nextCursor: undefined
        });
        mapper.mapToConversationDto
            .mockReturnValueOnce({ id: "c1" })
            .mockReturnValueOnce({ id: "c2" });
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const result = await useCase.getUserConversationsUseCase(USER_ID);
        expect(mapper.mapToConversationDto).toHaveBeenCalledTimes(2);
        expect(result.items).toEqual([
            { id: "c1" },
            { id: "c2" }
        ]);
    });
});
