"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const send_message_use_case_1 = require("../../../../src/modules/chat/application/message/send_message_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
describe("SendMessageUseCase", () => {
    let messageRepo;
    let conversationRepo;
    let mapper;
    let checkIsParticipant;
    let cacheService;
    let participantRepo;
    let userToUserBansRepo;
    let conversationBansRepo;
    let useCase;
    const USER_ID = "user-1";
    const USER_B = "user-2";
    const CONVERSATION_ID = "conv-1";
    beforeEach(() => {
        messageRepo = {
            create: jest.fn()
        };
        conversationRepo = {
            findById: jest.fn(),
            updateLastMessage: jest.fn()
        };
        mapper = {
            mapToMessage: jest.fn()
        };
        checkIsParticipant = {
            checkIsParticipant: jest.fn()
        };
        cacheService = {
            delByPattern: jest.fn(),
            del: jest.fn()
        };
        participantRepo = {
            getParticipants: jest.fn()
        };
        userToUserBansRepo = {
            ensureAnyBlocksExists: jest.fn()
        };
        conversationBansRepo = {
            isBanned: jest.fn()
        };
        useCase = new send_message_use_case_1.SendMessageUseCase(messageRepo, conversationRepo, mapper, checkIsParticipant, cacheService, participantRepo, userToUserBansRepo, conversationBansRepo);
    });
    // =========================
    // cannot send messages
    // =========================
    it("should throw if participant cannot send messages", async () => {
        checkIsParticipant.checkIsParticipant.mockResolvedValue({
            getCanSendMessages: () => false
        });
        await expect(useCase.sendMessageUseCase(USER_ID, CONVERSATION_ID, "hello")).rejects.toBeInstanceOf(participant_errors_1.UserIsNotAllowedToPerformError);
    });
    // =========================
    // happy path
    // =========================
    it("should send message successfully", async () => {
        const participant = {
            getCanSendMessages: () => true
        };
        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "direct"
        });
        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });
        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(false);
        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });
        const result = await useCase.sendMessageUseCase(USER_ID, CONVERSATION_ID, "hello world");
        expect(messageRepo.create).toHaveBeenCalled();
        expect(conversationRepo.updateLastMessage)
            .toHaveBeenCalledWith(CONVERSATION_ID, expect.any(Date));
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`messages:${CONVERSATION_ID}:*`);
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_ID}:*`);
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_B}:*`);
        expect(result).toEqual({ id: "msg-1" });
    });
    // =========================
    // blocking relations in direct conversation
    // =========================
    it("should throw if actor is blocked by target in direct conversation", async () => {
        const participant = {
            getCanSendMessages: () => true
        };
        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "direct"
        });
        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });
        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(true);
        await expect(useCase.sendMessageUseCase(USER_ID, CONVERSATION_ID, "hello")).rejects.toBeInstanceOf(participant_errors_1.UserIsNotAllowedToPerformError);
        expect(userToUserBansRepo.ensureAnyBlocksExists)
            .toHaveBeenCalledWith(USER_ID, USER_B);
    });
    it("should allow sending if no blocking relations in direct conversation", async () => {
        const participant = {
            getCanSendMessages: () => true
        };
        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "direct"
        });
        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });
        userToUserBansRepo.ensureAnyBlocksExists.mockResolvedValue(false);
        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });
        const result = await useCase.sendMessageUseCase(USER_ID, CONVERSATION_ID, "hello");
        expect(result).toEqual({ id: "msg-1" });
    });
    it("should skip blocking check for group conversations", async () => {
        const participant = {
            getCanSendMessages: () => true
        };
        checkIsParticipant.checkIsParticipant.mockResolvedValue(participant);
        conversationRepo.findById.mockResolvedValue({
            getConversationType: () => "group"
        });
        participantRepo.getParticipants.mockResolvedValue({
            items: [
                { userId: USER_ID },
                { userId: USER_B }
            ]
        });
        mapper.mapToMessage.mockReturnValue({ id: "msg-1" });
        const result = await useCase.sendMessageUseCase(USER_ID, CONVERSATION_ID, "hello");
        expect(userToUserBansRepo.ensureAnyBlocksExists).not.toHaveBeenCalled();
        expect(result).toEqual({ id: "msg-1" });
    });
});
