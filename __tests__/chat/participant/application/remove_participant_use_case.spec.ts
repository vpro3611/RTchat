import { RemoveParticipantUseCase } from "../../../../src/modules/chat/application/participant/remove_participant_use_case";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError,
    UserIsNotParticipantError
} from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { ParticipantRole } from "../../../../src/modules/chat/domain/participant/participant_role";

describe("RemoveParticipantUseCase", () => {

    let participantRepo: any;
    let cacheService: any;

    let useCase: RemoveParticipantUseCase;

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

        useCase = new RemoveParticipantUseCase(
            participantRepo,
            cacheService
        );

    });

    // =========================
    // actor not participant
    // =========================

    it("should throw if actor is not participant", async () => {

        participantRepo.findParticipant.mockResolvedValueOnce(null);

        await expect(
            useCase.removeParticipantUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
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

        participantRepo.findParticipant.mockResolvedValueOnce(actor);

        await expect(
            useCase.removeParticipantUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
            )
        ).rejects.toBeInstanceOf(InsufficientPermissionsError);

    });

    // =========================
    // target not participant
    // =========================

    it("should throw if target is not participant", async () => {

        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(null);

        await expect(
            useCase.removeParticipantUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
            )
        ).rejects.toBeInstanceOf(UserIsNotParticipantError);

    });

    // =========================
    // target is owner
    // =========================

    it("should throw if target is owner", async () => {

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
            useCase.removeParticipantUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
            )
        ).rejects.toBeInstanceOf(InsufficientPermissionsError);

    });

    // =========================
    // happy path
    // =========================

    it("should remove participant and invalidate cache", async () => {

        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        const target = {
            getRole: () => ParticipantRole.MEMBER
        };

        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        await useCase.removeParticipantUseCase(
            ACTOR_ID,
            CONVERSATION_ID,
            TARGET_ID
        );

        expect(participantRepo.remove)
            .toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}:*`);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`conv:user:${TARGET_ID}:*`);
        });


});