"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mark_conversation_read_use_case_1 = require("../../../../src/modules/chat/application/conversation/mark_conversation_read_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
describe("MarkConversationReadUseCase", () => {
    let conversationRepo;
    let participantRepo;
    let useCase;
    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";
    const MESSAGE_ID = "msg-1";
    beforeEach(() => {
        conversationRepo = {
            markRead: jest.fn()
        };
        participantRepo = {
            exists: jest.fn()
        };
        useCase = new mark_conversation_read_use_case_1.MarkConversationReadUseCase(conversationRepo, participantRepo);
    });
    // =========================
    // user not participant
    // =========================
    it("should throw if actor is not a participant", async () => {
        participantRepo.exists.mockResolvedValue(false);
        await expect(useCase.markConversationReadUseCase(USER_ID, CONVERSATION_ID, MESSAGE_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
        expect(conversationRepo.markRead).not.toHaveBeenCalled();
    });
    // =========================
    // happy path
    // =========================
    it("should mark conversation as read", async () => {
        participantRepo.exists.mockResolvedValue(true);
        await useCase.markConversationReadUseCase(USER_ID, CONVERSATION_ID, MESSAGE_ID);
        expect(conversationRepo.markRead).toHaveBeenCalledWith(CONVERSATION_ID, USER_ID, MESSAGE_ID);
    });
    // =========================
    // participant check
    // =========================
    it("should check if actor is participant", async () => {
        participantRepo.exists.mockResolvedValue(true);
        await useCase.markConversationReadUseCase(USER_ID, CONVERSATION_ID, MESSAGE_ID);
        expect(participantRepo.exists).toHaveBeenCalledWith(CONVERSATION_ID, USER_ID);
    });
});
