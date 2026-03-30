"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_specific_participant_use_case_1 = require("../../../../src/modules/chat/application/participant/get_specific_participant_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
const use_case_errors_1 = require("../../../../src/modules/users/errors/use_case_errors");
describe("GetSpecificParticipantUseCase", () => {
    let participantRepo;
    let cacheService;
    let useCase;
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
        useCase = new get_specific_participant_use_case_1.GetSpecificParticipantUseCase(participantRepo, cacheService);
    });
    // =========================
    // actor guard
    // =========================
    it("should throw if actor is not participant", async () => {
        participantRepo.exists.mockResolvedValue(false);
        await expect(useCase.getSpecificParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
    });
    // =========================
    // cache key
    // =========================
    it("should use correct cache key", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        participantRepo.getSpecificParticipant.mockResolvedValue({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            username: "testuser",
            email: "test@test.com",
            role: "member",
            canSendMessages: true,
            mutedUntil: null,
            joinedAt: new Date(),
        });
        await useCase.getSpecificParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID);
        expect(cacheService.remember).toHaveBeenCalledWith(`participant:conv:${CONVERSATION_ID}:user:${TARGET_ID}`, 60, expect.any(Function));
    });
    // =========================
    // repo call
    // =========================
    it("should call repository inside cache callback", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        participantRepo.getSpecificParticipant.mockResolvedValue({
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            username: "testuser",
            email: "test@test.com",
            role: "member",
            canSendMessages: true,
            mutedUntil: null,
            joinedAt: new Date(),
        });
        await useCase.getSpecificParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID);
        expect(participantRepo.getSpecificParticipant)
            .toHaveBeenCalledWith(CONVERSATION_ID, TARGET_ID);
    });
    // =========================
    // not found
    // =========================
    it("should throw if participant not found", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        participantRepo.getSpecificParticipant.mockResolvedValue(null);
        await expect(useCase.getSpecificParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID)).rejects.toBeInstanceOf(use_case_errors_1.UserNotFoundError);
    });
    // =========================
    // success
    // =========================
    it("should return participant", async () => {
        participantRepo.exists.mockResolvedValue(true);
        const joinedAt = new Date();
        const participant = {
            conversationId: CONVERSATION_ID,
            userId: TARGET_ID,
            username: "testuser",
            email: "test@test.com",
            role: "member",
            canSendMessages: true,
            mutedUntil: null,
            joinedAt: joinedAt,
        };
        participantRepo.getSpecificParticipant.mockResolvedValue(participant);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const result = await useCase.getSpecificParticipantUseCase(ACTOR_ID, CONVERSATION_ID, TARGET_ID);
        // Use case converts Date to ISO string
        expect(result).toEqual({
            participant: {
                ...participant,
                joinedAt: joinedAt.toISOString(),
            }
        });
    });
});
