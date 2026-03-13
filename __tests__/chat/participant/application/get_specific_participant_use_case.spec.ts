import { GetSpecificParticipantUseCase } from "../../../../src/modules/chat/application/participant/get_specific_participant_use_case";
import { ActorIsNotParticipantError } from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { UserNotFoundError } from "../../../../src/modules/users/errors/use_case_errors";

describe("GetSpecificParticipantUseCase", () => {

    let participantRepo: any;
    let cacheService: any;

    let useCase: GetSpecificParticipantUseCase;

    const ACTOR_ID = "user-1";
    const TARGET_ID = "user-2";
    const CONVERSATION_ID = "conv-1";

    beforeEach(() => {

        participantRepo = {
            exists: jest.fn(),
            getSpecificParticipant: jest.fn()
        };

        cacheService = {
            remember: jest.fn()
        };

        useCase = new GetSpecificParticipantUseCase(
            participantRepo,
            cacheService
        );

    });

    // =========================
    // actor guard
    // =========================

    it("should throw if actor is not participant", async () => {

        participantRepo.exists.mockResolvedValue(false);

        await expect(
            useCase.getSpecificParticipantUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
            )
        ).rejects.toBeInstanceOf(ActorIsNotParticipantError);

    });

    // =========================
    // cache key
    // =========================

    it("should use correct cache key", async () => {

        participantRepo.exists.mockResolvedValue(true);

        cacheService.remember.mockImplementation(
            async (_key: string, _ttl: number, callback: any) => callback()
        );

        participantRepo.getSpecificParticipant.mockResolvedValue({
            userId: TARGET_ID
        });

        await useCase.getSpecificParticipantUseCase(
            ACTOR_ID,
            CONVERSATION_ID,
            TARGET_ID
        );

        expect(cacheService.remember).toHaveBeenCalledWith(
            `participant:conv:${CONVERSATION_ID}:user:${TARGET_ID}`,
            60,
            expect.any(Function)
        );

    });

    // =========================
    // repo call
    // =========================

    it("should call repository inside cache callback", async () => {

        participantRepo.exists.mockResolvedValue(true);

        cacheService.remember.mockImplementation(
            async (_key: string, _ttl: number, callback: any) => callback()
        );

        participantRepo.getSpecificParticipant.mockResolvedValue({
            userId: TARGET_ID
        });

        await useCase.getSpecificParticipantUseCase(
            ACTOR_ID,
            CONVERSATION_ID,
            TARGET_ID
        );

        expect(participantRepo.getSpecificParticipant)
            .toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);

    });

    // =========================
    // not found
    // =========================

    it("should throw if participant not found", async () => {

        participantRepo.exists.mockResolvedValue(true);

        cacheService.remember.mockImplementation(
            async (_key: string, _ttl: number, callback: any) => callback()
        );

        participantRepo.getSpecificParticipant.mockResolvedValue(null);

        await expect(
            useCase.getSpecificParticipantUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
            )
        ).rejects.toBeInstanceOf(UserNotFoundError);

    });

    // =========================
    // success
    // =========================

    it("should return participant", async () => {

        participantRepo.exists.mockResolvedValue(true);

        const participant = {
            userId: TARGET_ID
        };

        participantRepo.getSpecificParticipant.mockResolvedValue(participant);

        cacheService.remember.mockImplementation(
            async (_key: string, _ttl: number, callback: any) => callback()
        );

        const result = await useCase.getSpecificParticipantUseCase(
            ACTOR_ID,
            CONVERSATION_ID,
            TARGET_ID
        );

        expect(result).toEqual(participant);

    });

});