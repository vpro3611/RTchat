"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ban_group_participant_use_case_1 = require("../../../../src/modules/chat/application/participant/ban_group_participant_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const participant_role_1 = require("../../../../src/modules/chat/domain/participant/participant_role");
describe("BanGroupParticipantUseCase", () => {
    let participantRepo;
    let conversationBanRepoInterface;
    let cacheService;
    let useCase;
    const ACTOR_ID = "11111111-1111-1111-1111-111111111111";
    const TARGET_ID = "22222222-2222-2222-2222-222222222222";
    const CONVERSATION_ID = "33333333-3333-3333-3333-333333333333";
    beforeEach(() => {
        participantRepo = {
            findParticipant: jest.fn(),
            remove: jest.fn()
        };
        conversationBanRepoInterface = {
            ban: jest.fn(),
            isBanned: jest.fn()
        };
        cacheService = {
            del: jest.fn(),
            delByPattern: jest.fn()
        };
        useCase = new ban_group_participant_use_case_1.BanGroupParticipantUseCase(participantRepo, conversationBanRepoInterface, cacheService);
    });
    // =========================
    // Actor not participant
    // =========================
    it("should throw if actor is not a participant of the conversation", async () => {
        participantRepo.findParticipant.mockResolvedValueOnce(null);
        await expect(useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Spam"
        })).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
        expect(participantRepo.findParticipant).toHaveBeenCalledWith(CONVERSATION_ID, ACTOR_ID);
    });
    // =========================
    // Target not participant
    // =========================
    it("should throw if target is not a participant of the conversation", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor) // actor found
            .mockResolvedValueOnce(null); // target not found
        await expect(useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Spam"
        })).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
    });
    // =========================
    // Actor not owner (cannot ban)
    // =========================
    it("should throw if actor is not owner and cannot ban", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID,
            canBanOther: () => false
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            getConversationId: () => CONVERSATION_ID,
            userId: TARGET_ID
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        await expect(useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Spam"
        })).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // Cannot ban owner
    // =========================
    it("should throw if trying to ban the owner", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID,
            canBanOther: () => false // owner cannot ban other owner
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: TARGET_ID
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        await expect(useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Spam"
        })).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // Cannot ban self
    // =========================
    it("should throw if actor tries to ban themselves", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID,
            canBanOther: () => false // cannot ban self
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(actor); // target is same as actor
        await expect(useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: ACTOR_ID, // same as bannedBy
            bannedBy: ACTOR_ID,
            reason: "Spam"
        })).rejects.toBeInstanceOf(participant_errors_1.InsufficientPermissionsError);
    });
    // =========================
    // Happy path - owner bans member
    // =========================
    it("should successfully ban a member as owner", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID,
            canBanOther: () => true
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            getConversationId: () => CONVERSATION_ID,
            userId: TARGET_ID
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        conversationBanRepoInterface.ban.mockResolvedValue(undefined);
        participantRepo.remove.mockResolvedValue(undefined);
        const result = await useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Spam behavior"
        });
        expect(conversationBanRepoInterface.ban).toHaveBeenCalledWith(expect.objectContaining({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Spam behavior"
        }));
        expect(participantRepo.remove).toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);
        // Cache invalidation
        expect(cacheService.del).toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}`);
        expect(cacheService.delByPattern).toHaveBeenCalledWith(`conv:user:${TARGET_ID}:*`);
        expect(cacheService.del).toHaveBeenCalledWith(`bans:conv:${CONVERSATION_ID}`);
        expect(result.userId).toBe(TARGET_ID);
        expect(result.conversationId).toBe(CONVERSATION_ID);
        expect(result.bannedBy).toBe(ACTOR_ID);
    });
    // =========================
    // Reason validation
    // =========================
    it("should store the reason for ban", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID,
            canBanOther: () => true
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            getConversationId: () => CONVERSATION_ID,
            userId: TARGET_ID
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        conversationBanRepoInterface.ban.mockResolvedValue(undefined);
        participantRepo.remove.mockResolvedValue(undefined);
        const customReason = "Custom ban reason for testing";
        const result = await useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: customReason
        });
        expect(conversationBanRepoInterface.ban).toHaveBeenCalledWith(expect.objectContaining({
            reason: customReason
        }));
    });
    // =========================
    // Cache invalidation
    // =========================
    it("should invalidate all relevant caches after ban", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID,
            canBanOther: () => true
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            getConversationId: () => CONVERSATION_ID,
            userId: TARGET_ID
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        conversationBanRepoInterface.ban.mockResolvedValue(undefined);
        participantRepo.remove.mockResolvedValue(undefined);
        await useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Test"
        });
        // Verify all cache invalidation calls
        expect(cacheService.del).toHaveBeenCalledTimes(2); // participants + bans
        expect(cacheService.delByPattern).toHaveBeenCalledTimes(1);
    });
    // =========================
    // Error handling
    // =========================
    it("should propagate errors from ban repository", async () => {
        const actor = {
            getRole: () => participant_role_1.ParticipantRole.OWNER,
            getConversationId: () => CONVERSATION_ID,
            userId: ACTOR_ID,
            canBanOther: () => true
        };
        const target = {
            getRole: () => participant_role_1.ParticipantRole.MEMBER,
            getConversationId: () => CONVERSATION_ID,
            userId: TARGET_ID
        };
        participantRepo.findParticipant
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);
        const dbError = new Error("Database connection failed");
        conversationBanRepoInterface.ban.mockRejectedValue(dbError);
        await expect(useCase.banGroupParticipantUseCase({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            bannedBy: ACTOR_ID,
            reason: "Spam"
        })).rejects.toThrow("Database connection failed");
    });
});
