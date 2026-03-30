"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_specific_message_use_case_1 = require("../../../../src/modules/chat/application/message/get_specific_message_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const message_errors_1 = require("../../../../src/modules/chat/errors/message_errors/message_errors");
describe("GetSpecificMessageUseCase", () => {
    let messageMapper;
    let findMessageById;
    let participantRepo;
    let cacheService;
    let useCase;
    const ACTOR_ID = "user-1";
    const CONVERSATION_ID = "conv-1";
    const MESSAGE_ID = "msg-1";
    beforeEach(() => {
        messageMapper = {
            mapToMessage: jest.fn()
        };
        findMessageById = {
            findMessageById: jest.fn()
        };
        participantRepo = {
            exists: jest.fn()
        };
        cacheService = {
            remember: jest.fn()
        };
        useCase = new get_specific_message_use_case_1.GetSpecificMessageUseCase(messageMapper, findMessageById, participantRepo, cacheService);
    });
    // =========================
    // actor guard
    // =========================
    it("should throw if actor is not participant", async () => {
        participantRepo.exists.mockResolvedValue(false);
        await expect(useCase.getSpecificMessageUseCase(ACTOR_ID, CONVERSATION_ID, MESSAGE_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
    });
    // =========================
    // cache key
    // =========================
    it("should use correct cache key", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const message = {
            getConversationId: jest.fn().mockReturnValue(CONVERSATION_ID)
        };
        findMessageById.findMessageById.mockResolvedValue(message);
        messageMapper.mapToMessage.mockReturnValue({ id: MESSAGE_ID });
        await useCase.getSpecificMessageUseCase(ACTOR_ID, CONVERSATION_ID, MESSAGE_ID);
        expect(cacheService.remember).toHaveBeenCalledWith(`message:conv:${CONVERSATION_ID}:id:${MESSAGE_ID}`, 60, expect.any(Function));
    });
    // =========================
    // find message call
    // =========================
    it("should call findMessageById inside cache callback", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const message = {
            getConversationId: jest.fn().mockReturnValue(CONVERSATION_ID)
        };
        findMessageById.findMessageById.mockResolvedValue(message);
        messageMapper.mapToMessage.mockReturnValue({ id: MESSAGE_ID });
        await useCase.getSpecificMessageUseCase(ACTOR_ID, CONVERSATION_ID, MESSAGE_ID);
        expect(findMessageById.findMessageById)
            .toHaveBeenCalledWith(MESSAGE_ID);
    });
    // =========================
    // conversation validation
    // =========================
    it("should throw if message does not belong to conversation", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const message = {
            getConversationId: jest.fn().mockReturnValue("another-conv")
        };
        findMessageById.findMessageById.mockResolvedValue(message);
        await expect(useCase.getSpecificMessageUseCase(ACTOR_ID, CONVERSATION_ID, MESSAGE_ID)).rejects.toBeInstanceOf(message_errors_1.MessageNotAPartOfConversationError);
    });
    // =========================
    // success
    // =========================
    it("should map and return message", async () => {
        participantRepo.exists.mockResolvedValue(true);
        const message = {
            getConversationId: jest.fn().mockReturnValue(CONVERSATION_ID)
        };
        const mappedMessage = {
            id: MESSAGE_ID
        };
        findMessageById.findMessageById.mockResolvedValue(message);
        messageMapper.mapToMessage.mockReturnValue(mappedMessage);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const result = await useCase.getSpecificMessageUseCase(ACTOR_ID, CONVERSATION_ID, MESSAGE_ID);
        expect(messageMapper.mapToMessage)
            .toHaveBeenCalledWith(message);
        expect(result).toEqual(mappedMessage);
    });
});
