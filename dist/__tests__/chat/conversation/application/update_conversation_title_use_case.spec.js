"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const update_conversation_title_use_case_1 = require("../../../../src/modules/chat/application/conversation/update_conversation_title_use_case");
const conversation_type_1 = require("../../../../src/modules/chat/domain/conversation/conversation_type");
const participant_role_1 = require("../../../../src/modules/chat/domain/participant/participant_role");
const conversation_errors_1 = require("../../../../src/modules/chat/errors/conversation_errors/conversation_errors");
describe("UpdateConversationTitleUseCase", () => {
    let conversationRepo;
    let checkIsParticipant;
    let mapper;
    let cacheService;
    let participantRepo;
    let useCase;
    const ACTOR_ID = "user-1";
    const CONVERSATION_ID = "conv-1";
    beforeEach(() => {
        conversationRepo = {
            findById: jest.fn(),
            update: jest.fn()
        };
        checkIsParticipant = {
            checkIsParticipant: jest.fn()
        };
        mapper = {
            mapToConversationDto: jest.fn()
        };
        cacheService = {
            delByPattern: jest.fn()
        };
        participantRepo = {
            getParticipants: jest.fn()
        };
        useCase = new update_conversation_title_use_case_1.UpdateConversationTitleUseCase(conversationRepo, checkIsParticipant, mapper, cacheService, participantRepo);
    });
    // =========================
    // conversation not found
    // =========================
    it("should throw if conversation does not exist", async () => {
        checkIsParticipant.checkIsParticipant.mockResolvedValue({});
        conversationRepo.findById.mockResolvedValue(null);
        await expect(useCase.updateConversationTitleUseCase(ACTOR_ID, CONVERSATION_ID, "new title")).rejects.toBeInstanceOf(conversation_errors_1.ConversationNotFoundError);
    });
    // =========================
    // direct conversation
    // =========================
    it("should throw if conversation is direct", async () => {
        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getCanSendMessages: () => true
        });
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => conversation_type_1.ConversationType.DIRECT
        });
        await expect(useCase.updateConversationTitleUseCase(ACTOR_ID, CONVERSATION_ID, "new title")).rejects.toBeInstanceOf(conversation_errors_1.CannotUpdateTitleError);
    });
    // =========================
    // not owner
    // =========================
    it("should throw if actor is not owner", async () => {
        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            getCanSendMessages: () => true
        });
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => conversation_type_1.ConversationType.GROUP
        });
        await expect(useCase.updateConversationTitleUseCase(ACTOR_ID, CONVERSATION_ID, "new title")).rejects.toBeInstanceOf(conversation_errors_1.CannotUpdateTitleError);
    });
    // =========================
    // cannot send messages
    // =========================
    it("should throw if participant cannot send messages", async () => {
        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getCanSendMessages: () => false
        });
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => conversation_type_1.ConversationType.GROUP
        });
        await expect(useCase.updateConversationTitleUseCase(ACTOR_ID, CONVERSATION_ID, "new title")).rejects.toBeInstanceOf(conversation_errors_1.CannotUpdateTitleError);
    });
    // =========================
    // happy path
    // =========================
    it("should update conversation title", async () => {
        const conversation = {
            getConversationType: () => conversation_type_1.ConversationType.GROUP,
            updateTitle: jest.fn()
        };
        const participant = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getCanSendMessages: () => true
        };
        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        conversationRepo.findById.mockResolvedValue(conversation);
        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: "user-1" },
                { userId: "user-2" }
            ]
        });
        mapper.mapToConversationDto.mockReturnValue({ id: "conv1" });
        const result = await useCase.updateConversationTitleUseCase(ACTOR_ID, CONVERSATION_ID, "new title");
        expect(conversation.updateTitle).toHaveBeenCalledWith("new title");
        expect(conversationRepo.update).toHaveBeenCalledWith(conversation);
        expect(cacheService.delByPattern).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ id: "conv1" });
    });
});
