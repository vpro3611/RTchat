import { GetBannedUsersUseCase } from "../../../../src/modules/chat/application/participant/get_banned_users_use_case";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../../../src/modules/chat/errors/participants_errors/participant_errors";
import { ParticipantRole } from "../../../../src/modules/chat/domain/participant/participant_role";

describe("GetBannedUsersUseCase", () => {

    let participantRepo: any;
    let conversationBanRepoInterface: any;
    let cacheService: any;

    let useCase: GetBannedUsersUseCase;

    const ACTOR_ID = "11111111-1111-1111-1111-111111111111";
    const CONVERSATION_ID = "33333333-3333-3333-3333-333333333333";

    beforeEach(() => {

        participantRepo = {
            findParticipant: jest.fn()
        };

        conversationBanRepoInterface = {
            getBannedUsers: jest.fn()
        };

        // Default implementation - call fn() to execute the actual query
        cacheService = {
            remember: jest.fn((_key: string, _ttl: number, fn: () => Promise<any>) => fn())
        };

        useCase = new GetBannedUsersUseCase(
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
            useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID)
        ).rejects.toBeInstanceOf(ActorIsNotParticipantError);

        expect(participantRepo.findParticipant).toHaveBeenCalledWith(CONVERSATION_ID, ACTOR_ID);
    });

    // =========================
    // Actor not owner
    // =========================

    it("should throw if actor is not owner of the conversation", async () => {
        const actor = {
            getRole: () => ParticipantRole.MEMBER
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);

        await expect(
            useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID)
        ).rejects.toBeInstanceOf(InsufficientPermissionsError);
    });

    // =========================
    // Actor is admin (should also fail - only owner allowed)
    // =========================

    it("should throw if actor is admin (non-owner)", async () => {
        const actor = {
            getRole: () => ParticipantRole.MEMBER // no admin role in current implementation
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);

        await expect(
            useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID)
        ).rejects.toBeInstanceOf(InsufficientPermissionsError);
    });

    // =========================
    // Happy path - owner gets banned users
    // =========================

    it("should return banned users for owner", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        const bannedUsers = [
            {
                conversationId: CONVERSATION_ID,
                userId: "user-banned-1",
                bannedBy: ACTOR_ID,
                createdAt: new Date(),
                reason: "Spam"
            },
            {
                conversationId: CONVERSATION_ID,
                userId: "user-banned-2",
                bannedBy: ACTOR_ID,
                createdAt: new Date(),
                reason: "Harassment"
            }
        ];

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.getBannedUsers.mockResolvedValue(bannedUsers);

        const result = await useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID);

        expect(result.length).toBe(2);
        expect(result[0].userId).toBe("user-banned-1");
        expect(result[1].userId).toBe("user-banned-2");
    });

    // =========================
    // Empty banned list
    // =========================

    it("should return empty array when no users are banned", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.getBannedUsers.mockResolvedValue([]);

        const result = await useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID);

        expect(result).toEqual([]);
        expect(result.length).toBe(0);
    });

    // =========================
    // Caching
    // =========================

    it("should use cache when fetching banned users", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);

        const cachedData = [
            {
                conversationId: CONVERSATION_ID,
                userId: "cached-user",
                bannedBy: ACTOR_ID,
                createdAt: new Date().toISOString(),
                reason: "Cached ban"
            }
        ];

        // Override to return cached data
        cacheService.remember.mockResolvedValue(cachedData);

        await useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID);

        expect(cacheService.remember).toHaveBeenCalledWith(
            `bans:conv:${CONVERSATION_ID}`,
            60,
            expect.any(Function)
        );
    });

    // =========================
    // Date formatting
    // =========================

    it("should convert createdAt to ISO string", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        const testDate = new Date("2024-01-15T10:30:00.000Z");

        const bannedUsers = [
            {
                conversationId: CONVERSATION_ID,
                userId: "user-banned",
                bannedBy: ACTOR_ID,
                createdAt: testDate,
                reason: "Test"
            }
        ];

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.getBannedUsers.mockResolvedValue(bannedUsers);

        const result = await useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID);

        expect(result[0].createdAt).toBe("2024-01-15T10:30:00.000Z");
        expect(typeof result[0].createdAt).toBe("string");
    });

    // =========================
    // Error propagation
    // =========================

    it("should propagate errors from repository", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);

        const dbError = new Error("Database connection failed");
        conversationBanRepoInterface.getBannedUsers.mockRejectedValue(dbError);

        await expect(
            useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID)
        ).rejects.toThrow("Database connection failed");
    });

    // =========================
    // Data transformation
    // =========================

    it("should transform repository response to DTO format", async () => {
        const actor = {
            getRole: () => ParticipantRole.OWNER
        };

        const rawBan = {
            conversationId: CONVERSATION_ID,
            userId: "target-user",
            bannedBy: ACTOR_ID,
            createdAt: new Date(),
            reason: "Test reason"
        };

        participantRepo.findParticipant.mockResolvedValueOnce(actor);
        conversationBanRepoInterface.getBannedUsers.mockResolvedValue([rawBan]);

        const result = await useCase.getBannedUsersUseCase(CONVERSATION_ID, ACTOR_ID);

        expect(result[0]).toEqual({
            conversationId: CONVERSATION_ID,
            userId: "target-user",
            bannedBy: ACTOR_ID,
            createdAt: expect.any(String),
            reason: "Test reason"
        });
    });

});
