import { MuteParticipantUseCase } from "../../../../src/modules/chat/application/participant/mute_participant_use_case";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { ParticipantRole } from "../../../../src/modules/chat/domain/participant/participant_role";
import { MuteDuration } from "../../../../src/modules/chat/domain/participant/mute_duration";

describe("MuteParticipantUseCase", () => {

    let participantRepo: any;
    let mapper: any;
    let cacheService: any;

    let useCase: MuteParticipantUseCase;

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
            del: jest.fn(),
            delByPattern: jest.fn().mockResolvedValue(undefined)
        };

        useCase = new MuteParticipantUseCase(
            participantRepo,
            mapper,
            cacheService
        );

    });

    // =========================
    // actor not participant
    // =========================

    it("should throw if actor is not participant", async () => {

        participantRepo.findParticipant.mockResolvedValueOnce(null);

        await expect(
            useCase.muteParticipantUseCase(
                ACTOR_ID,
                TARGET_ID,
                CONVERSATION_ID,
                MuteDuration.ONE_HOUR
            )
        ).rejects.toBeInstanceOf(ActorIsNotParticipantError);

    });

    // =========================
    // target not participant
    // =========================

    it("should throw if target is not participant", async () => {

        participantRepo.findParticipant
            .mockResolvedValueOnce({}) // actor
            .mockResolvedValueOnce(null); // target

        await expect(
            useCase.muteParticipantUseCase(
                ACTOR_ID,
                TARGET_ID,
                CONVERSATION_ID,
                MuteDuration.ONE_HOUR
            )
        ).rejects.toBeInstanceOf(ActorIsNotParticipantError);

    });

    // =========================
    // actor not owner
    // =========================

    it("should throw if actor is not owner", async () => {

        const actor = {
            getRole: () => ParticipantRole.MEMBER
        };

        const target = {
            getRole: () => ParticipantRole.MEMBER
        };

        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        await expect(
            useCase.muteParticipantUseCase(
                ACTOR_ID,
                TARGET_ID,
                CONVERSATION_ID,
                MuteDuration.ONE_HOUR
            )
        ).rejects.toBeInstanceOf(InsufficientPermissionsError);

    });

    // =========================
    // target not member
    // =========================

    it("should throw if target is not member", async () => {

        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        const target = {
            getRole: () => ParticipantRole.OWNER
        };

        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        await expect(
            useCase.muteParticipantUseCase(
                ACTOR_ID,
                TARGET_ID,
                CONVERSATION_ID,
                MuteDuration.ONE_HOUR
            )
        ).rejects.toBeInstanceOf(InsufficientPermissionsError);

    });

    // =========================
    // happy path
    // =========================

    it("should mute participant successfully", async () => {

        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        const target = {
            getRole: () => ParticipantRole.MEMBER,
            mute: jest.fn()
        };

        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        mapper.mapToParticipantDto.mockReturnValue({
            userId: TARGET_ID
        });

        const result = await useCase.muteParticipantUseCase(
            ACTOR_ID,
            TARGET_ID,
            CONVERSATION_ID,
            MuteDuration.ONE_HOUR
        );

        expect(target.mute).toHaveBeenCalled();

        expect(participantRepo.save).toHaveBeenCalledWith(target);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}:*`);

        expect(cacheService.del)
            .toHaveBeenCalledWith(`participant:conv:${CONVERSATION_ID}:user:${TARGET_ID}`);

        expect(result).toEqual({ userId: TARGET_ID });

    });

});