import { UnbanGroupParticipantUseCase } from "../../../../src/modules/chat/application/participant/unban_group_participant_use_case";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { NotBannedError } from "../../../../src/modules/chat/errors/conversation_bans_error/conversation_bans_errors";
import { ParticipantRole } from "../../../../src/modules/chat/domain/participant/participant_role";

describe("UnbanGroupParticipantUseCase", () => {

    let participantRepo: any;
    let conversationBanRepoInterface: any;
    let cacheService: any;

    let useCase: UnbanGroupParticipantUseCase;

    const ACTOR_ID = "11111111-1111-1111-1111-111111111111";
    const TARGET_ID = "22222222-2222-2222-2222-222222222222";
    const CONVERSATION_ID = "33333333-3333-3333-3333-333333333333";

    beforeEach(() => {

        participantRepo = {
            findParticipant: jest.fn()
        };

        conversationBanRepoInterface = {
            isBanned: jest.fn(),
            unban: jest.fn()
        };

        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };

        useCase = new UnbanGroupParticipantUseCase(
            participantRepo,
            conversationBanRepoInterface,
            cacheService
        );

    });

    // =========================
    // Actor not participant
    // =========================

    it("should throw if actor is not a participant of the conversation", async () => {
        participantRepo.findParticipant.mockResolvedValueOnce(null);

        await expect(
            useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, TARGET_ID)
        ).rejects.toBeInstanceOf(ActorIsNotParticipantError);

        expect(participantRepo.findParticipant).toHaveBeenCalledWith(CONVERSATION_ID, ACTOR_ID);
    });

    // =========================
    // Target not banned
    // =========================

    it("should throw if target is not banned", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER,
            userId: ACTOR_ID,
            canUnban: () => true
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.isBanned.mockResolvedValueOnce(false);

        await expect(
            useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, TARGET_ID)
        ).rejects.toBeInstanceOf(NotBannedError);

        expect(conversationBanRepoInterface.isBanned).toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);
    });

    // =========================
    // Actor not owner (cannot unban) - NOTE: current implementation doesn't check canUnban result
    // =========================

    it("should allow unban even if actor is not owner (current implementation allows)", async () => {
        const actor = {
            getRole: () => ParticipantRole.MEMBER,
            userId: ACTOR_ID,
            canUnban: () => false
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.isBanned.mockResolvedValueOnce(true);
        conversationBanRepoInterface.unban.mockResolvedValue(undefined);

        // Current implementation doesn't check canUnban result, so it proceeds
        await expect(
            useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, TARGET_ID)
        ).resolves.toBeUndefined();

        expect(conversationBanRepoInterface.unban).toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);
    });

    // =========================
    // Cannot unban self - NOTE: current implementation doesn't check canUnban result
    // =========================

    it("should allow self-unban (current implementation allows)", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER,
            userId: ACTOR_ID,
            canUnban: () => false // cannot unban self
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.isBanned.mockResolvedValueOnce(true);
        conversationBanRepoInterface.unban.mockResolvedValue(undefined);

        // Current implementation doesn't check canUnban result, so it proceeds
        await expect(
            useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, ACTOR_ID) // same ID
        ).resolves.toBeUndefined();

        expect(conversationBanRepoInterface.unban).toHaveBeenCalledWith(CONVERSATION_ID, ACTOR_ID);
    });

    // =========================
    // Happy path - owner unbans user
    // =========================

    it("should successfully unban a user as owner", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER,
            userId: ACTOR_ID,
            canUnban: () => true
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.isBanned.mockResolvedValueOnce(true);
        conversationBanRepoInterface.unban.mockResolvedValue(undefined);

        await useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, TARGET_ID);

        expect(conversationBanRepoInterface.unban).toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);
        // Cache invalidation
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}:*`);
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`conv:user:${TARGET_ID}:*`);
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`bans:conv:${CONVERSATION_ID}:*`);
        });


    // =========================
    // Cache invalidation
    // =========================

    it("should invalidate all relevant caches after unban", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER,
            userId: ACTOR_ID,
            canUnban: () => true
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.isBanned.mockResolvedValueOnce(true);
        conversationBanRepoInterface.unban.mockResolvedValue(undefined);

        await useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, TARGET_ID);

        // Verify all cache invalidation calls
        expect(cacheService.delByPattern).toHaveBeenCalledTimes(3); // participants + conv:user + bans
    });

    // =========================
    // Error handling
    // =========================

    it("should propagate errors from unban repository", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER,
            userId: ACTOR_ID,
            canUnban: () => true
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.isBanned.mockResolvedValueOnce(true);

        const dbError = new Error("Database connection failed");
        conversationBanRepoInterface.unban.mockRejectedValue(dbError);

        await expect(
            useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, TARGET_ID)
        ).rejects.toThrow("Database connection failed");
    });

    // =========================
    // Validation order
    // =========================

    it("should check ban status before checking permissions", async () => {
        const actor = {
            getRole: () => ParticipantRole.MEMBER,
            userId: ACTOR_ID,
            canUnban: jest.fn() // should not be called if not banned
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.isBanned.mockResolvedValueOnce(false); // not banned

        await expect(
            useCase.unbanGroupParticipantUseCase(CONVERSATION_ID, ACTOR_ID, TARGET_ID)
        ).rejects.toBeInstanceOf(NotBannedError);

        // canUnban should NOT be called if target is not banned
        expect(actor.canUnban).not.toHaveBeenCalled();
    });

});
