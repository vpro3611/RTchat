"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unmute_participant_use_case_1 = require("../../../../src/modules/chat/application/participant/unmute_participant_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const participant_role_1 = require("../../../../src/modules/chat/domain/participant/participant_role");
describe("UnmuteParticipantUseCase", () => {
    let participantRepo;
    let mapper;
    let cacheService;
    let useCase;
    const ACTOR_ID = "owner";
    const TARGET_ID = "member";
    const CONVERSATION_ID = "conv-1";
    beforeEach(() => {
        participantRepo = {
            findParticipant: jest.fn(),
            save: jest.fn()
        };
        mapper = {
            mapToParticipantDto: jest.fn()
        };
        cacheService = {
            del: jest.fn()
        };
        useCase = new unmute_participant_use_case_1.UnmuteParticipantUseCase(participantRepo, mapper, cacheService);
    });
    // =========================
    // actor not participant
    // =========================
    it("should throw if actor is not participant", async () => {
        participantRepo.findParticipant.mockResolvedValueOnce(null);
        await expect(useCase.unmuteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
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
        await expect(useCase.unmuteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
    });
    // =========================
    // actor not owner
    // =========================
    it("should throw if actor is not owner", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        await expect(useCase.unmuteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // happy path
    // =========================
    it("should unmute participant successfully", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            unmute: jest.fn()
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        mapper.mapToParticipantDto.mockReturnValue({
            userId: TARGET_ID
        });
        const result = await useCase.unmuteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID);
        expect(target.unmute).toHaveBeenCalled();
        expect(participantRepo.save).toHaveBeenCalledWith(target);
        expect(cacheService.del)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}`);
        expect(result).toEqual({ userId: TARGET_ID });
    });
});
