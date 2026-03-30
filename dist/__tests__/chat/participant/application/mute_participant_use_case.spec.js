"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mute_participant_use_case_1 = require("../../../../src/modules/chat/application/participant/mute_participant_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const participant_role_1 = require("../../../../src/modules/chat/domain/participant/participant_role");
const mute_duration_1 = require("../../../../src/modules/chat/domain/participant/mute_duration");
describe("MuteParticipantUseCase", () => {
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
        useCase = new mute_participant_use_case_1.MuteParticipantUseCase(participantRepo, mapper, cacheService);
    });
    // =========================
    // actor not participant
    // =========================
    it("should throw if actor is not participant", async () => {
        participantRepo.findParticipant.mockResolvedValueOnce(null);
        await expect(useCase.muteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID, mute_duration_1.MuteDuration.ONE_HOUR)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
    });
    // =========================
    // target not participant
    // =========================
    it("should throw if target is not participant", async () => {
        participantRepo.findParticipant
            .mockResolvedValueOnce({}) // actor
            .mockResolvedValueOnce(null); // target
        await expect(useCase.muteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID, mute_duration_1.MuteDuration.ONE_HOUR)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
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
        await expect(useCase.muteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID, mute_duration_1.MuteDuration.ONE_HOUR)).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // target not member
    // =========================
    it("should throw if target is not member", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        await expect(useCase.muteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID, mute_duration_1.MuteDuration.ONE_HOUR)).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // happy path
    // =========================
    it("should mute participant successfully", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            mute: jest.fn()
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        mapper.mapToParticipantDto.mockReturnValue({
            userId: TARGET_ID
        });
        const result = await useCase.muteParticipantUseCase(ACTOR_ID, TARGET_ID, CONVERSATION_ID, mute_duration_1.MuteDuration.ONE_HOUR);
        expect(target.mute).toHaveBeenCalled();
        expect(participantRepo.save).toHaveBeenCalledWith(target);
        expect(cacheService.del)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}`);
        expect(result).toEqual({ userId: TARGET_ID });
    });
});
