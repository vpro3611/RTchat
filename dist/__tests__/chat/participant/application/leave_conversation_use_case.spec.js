"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const leave_conversation_use_case_1 = require("../../../../src/modules/chat/application/participant/leave_conversation_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
describe("LeaveConversationUseCase", () => {
    let participantRepo;
    let cacheService;
    let useCase;
    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";
    beforeEach(() => {
        participantRepo = {
            exists: jest.fn(),
            remove: jest.fn()
        };
        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };
        useCase = new leave_conversation_use_case_1.LeaveConversationUseCase(participantRepo, cacheService);
    });
    // =========================
    // actor guard
    // =========================
    it("should throw if actor is not participant", async () => {
        participantRepo.exists.mockResolvedValue(false);
        await expect(useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
        expect(participantRepo.remove).not.toHaveBeenCalled();
    });
    // =========================
    // happy path
    // =========================
    it("should leave conversation successfully", async () => {
        participantRepo.exists.mockResolvedValue(true);
        await useCase.leaveConversationUseCase(USER_ID, CONVERSATION_ID);
        expect(participantRepo.remove)
            .toHaveBeenCalledWith(CONVERSATION_ID, USER_ID);
        expect(cacheService.del)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}`);
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${USER_ID}:*`);
    });
});
