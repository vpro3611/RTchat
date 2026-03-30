"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const remove_participant_use_case_1 = require("../../../../src/modules/chat/application/participant/remove_participant_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const participant_role_1 = require("../../../../src/modules/chat/domain/participant/participant_role");
describe("RemoveParticipantUseCase", () => {
    let participantRepo;
    let cacheService;
    let useCase;
    const ACTOR_ID = "owner";
    const TARGET_ID = "member";
    const CONVERSATION_ID = "conv-1";
    beforeEach(() => {
        participantRepo = {
            findParticipant: jest.fn(),
            remove: jest.fn()
        };
        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };
        useCase = new remove_participant_use_case_1.RemoveParticipantUseCase(participantRepo, cacheService);
    });
    // =========================
    // actor not participant
    // =========================
    it("should throw if actor is not participant", async () => {
        participantRepo.findParticipant.mockResolvedValueOnce(null);
        await expect(useCase.removeParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
    });
    // =========================
    // actor not owner
    // =========================
    it("should throw if actor is not owner", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER
        };
        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        await expect(useCase.removeParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID)).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // target not participant
    // =========================
    it("should throw if target is not participant", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(null);
        await expect(useCase.removeParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID)).rejects.toBeInstanceOf(participant_errors_1.UserIsNotParticipantError);
    });
    // =========================
    // target is owner
    // =========================
    it("should throw if target is owner", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        await expect(useCase.removeParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID)).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // happy path
    // =========================
    it("should remove participant and invalidate cache", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        await useCase.removeParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID);
        expect(participantRepo.remove)
            .toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);
        expect(cacheService.del)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}`);
        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${TARGET_ID}:*`);
    });
});
