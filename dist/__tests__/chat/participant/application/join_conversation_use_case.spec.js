"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const join_conversation_use_case_1 = require("../../../../src/modules/chat/application/participant/join_conversation_use_case");
const conversation_errors_1 = require("../../../../src/modules/chat/errors/conversation_errors/conversation_errors");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const conversation_type_1 = require("../../../../src/modules/chat/domain/conversation/conversation_type");
describe("JoinConversationUseCase", () => {
    let conversationRepo;
    let participantRepo;
    let cacheService;
    let conversationBansRepo;
    let conversationRequestsRepo;
    let requestMapper;
    let useCase;
    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";
    beforeEach(() => {
        conversationRepo = {
            findById: jest.fn()
        };
        participantRepo = {
            exists: jest.fn(),
            save: jest.fn()
        };
        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };
        conversationBansRepo = {
            isBanned: jest.fn()
        };
        conversationRequestsRepo = {
            create: jest.fn()
        };
        requestMapper = {
            mapToRequestDto: jest.fn()
        };
        useCase = new join_conversation_use_case_1.JoinConversationUseCase(conversationRepo, participantRepo, cacheService, conversationBansRepo, conversationRequestsRepo, requestMapper);
    });
    // =========================
    // conversation not found
    // =========================
    it("should throw if conversation does not exist", async () => {
        conversationRepo.findById.mockResolvedValue(null);
        await expect(useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(conversation_errors_1.ConversationNotFoundError);
    });
    // =========================
    // direct conversation
    // =========================
    it("should throw if conversation is direct", async () => {
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => conversation_type_1.ConversationType.DIRECT
        });
        await expect(useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(participant_errors_1.CannotJoinDirectConversationError);
    });
    // =========================
    // already participant
    // =========================
    it("should throw if user already participant", async () => {
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => conversation_type_1.ConversationType.GROUP
        });
        conversationBansRepo.isBanned.mockResolvedValue(false);
        participantRepo.exists.mockResolvedValue(true);
        await expect(useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(participant_errors_1.UserAlreadyParticipantError);
    });
    // =========================
    // happy path (now creates a request)
    // =========================
    it("should create a join request successfully", async () => {
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => conversation_type_1.ConversationType.GROUP
        });
        conversationBansRepo.isBanned.mockResolvedValue(false);
        participantRepo.exists.mockResolvedValue(false);
        requestMapper.mapToRequestDto.mockReturnValue({
            userId: USER_ID,
            status: "pending"
        });
        const result = await useCase.joinConversationUseCase(USER_ID, CONVERSATION_ID);
        expect(conversationRequestsRepo.create).toHaveBeenCalled();
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv_requests:group:${CONVERSATION_ID}:*`);
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv_requests:user:${USER_ID}:*`);
        expect(result).toEqual({ userId: USER_ID, status: "pending" });
    });
});
