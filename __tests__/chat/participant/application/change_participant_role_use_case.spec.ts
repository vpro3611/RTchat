import { ChangeParticipantRoleUseCase } from "../../../../src/modules/chat/application/participant/change_participant_role_use_case";
import {
    ActorIsNotParticipantError,
    UserIsNotParticipantError
} from "../../../../src/modules/chat/errors/participants_errors/participant_errors";

describe("ChangeParticipantRoleUseCase", () => {

    let participantRepo: any;
    let mapper: any;
    let cacheService: any;

    let useCase: ChangeParticipantRoleUseCase;

    const ACTOR_ID = "user-1";
    const TARGET_ID = "user-2";
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

        useCase = new ChangeParticipantRoleUseCase(
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
            useCase.changeParticipantRoleUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
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
            useCase.changeParticipantRoleUseCase(
                ACTOR_ID,
                CONVERSATION_ID,
                TARGET_ID
            )
        ).rejects.toBeInstanceOf(UserIsNotParticipantError);

    });

    // =========================
    // happy path
    // =========================

    it("should change participant role", async () => {

        const actor = { userId: ACTOR_ID };

        const target = {
            userId: TARGET_ID,
            changeRole: jest.fn()
        };

        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        mapper.mapToParticipantDto.mockReturnValue({
            userId: TARGET_ID
        });

        const result = await useCase.changeParticipantRoleUseCase(
            ACTOR_ID,
            CONVERSATION_ID,
            TARGET_ID
        );

        expect(target.changeRole).toHaveBeenCalledWith(actor, target);

        expect(participantRepo.save).toHaveBeenCalledWith(target);

        expect(cacheService.delByPattern)
            .toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}:*`);

        expect(cacheService.del)
            .toHaveBeenCalledWith(`participant:conv:${CONVERSATION_ID}:user:${TARGET_ID}`);

        expect(result).toEqual({ userId: TARGET_ID });

    });

});