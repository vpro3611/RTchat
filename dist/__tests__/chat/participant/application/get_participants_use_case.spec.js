"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_participants_use_case_1 = require("../../../../src/modules/chat/application/participant/get_participants_use_case");
const participant_errors_1 = require("../../../../src/modules/chat/errors/participants_errors/participant_errors");
describe("GetParticipantsUseCase", () => {
    let participantRepo;
    let cacheService;
    let useCase;
    const USER_ID = "user-1";
    const CONVERSATION_ID = "conv-1";
    beforeEach(() => {
        participantRepo = {
            exists: jest.fn(),
            getParticipants: jest.fn()
        };
        cacheService = {
            remember: jest.fn()
        };
        useCase = new get_participants_use_case_1.GetParticipantsUseCase(participantRepo, cacheService);
    });
    // =========================
    // actor guard
    // =========================
    it("should throw if actor is not participant", async () => {
        participantRepo.exists.mockResolvedValue(false);
        await expect(useCase.getParticipantsUseCase(USER_ID, CONVERSATION_ID)).rejects.toBeInstanceOf(participant_errors_1.ActorIsNotParticipantError);
    });
    // =========================
    // default cache key
    // =========================
    it("should use default limit and cursor", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        participantRepo.getParticipants.mockResolvedValue({
            items: [],
            nextCursor: undefined
        });
        await useCase.getParticipantsUseCase(USER_ID, CONVERSATION_ID);
        expect(cacheService.remember).toHaveBeenCalledWith(`participants:conv:${CONVERSATION_ID}:limit:20:cursor:start`, 60, expect.any(Function));
    });
    // =========================
    // repo call
    // =========================
    it("should call repository inside cache callback", async () => {
        participantRepo.exists.mockResolvedValue(true);
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        participantRepo.getParticipants.mockResolvedValue({
            items: [],
            nextCursor: undefined
        });
        await useCase.getParticipantsUseCase(USER_ID, CONVERSATION_ID, 10, "cursor1");
        expect(participantRepo.getParticipants)
            .toHaveBeenCalledWith(CONVERSATION_ID, 10, "cursor1");
    });
    // =========================
    // returns participants with username/email
    // =========================
    it("should return participants with username and email", async () => {
        participantRepo.exists.mockResolvedValue(true);
        const participants = [
            { userId: "u1", username: "user1", email: "user1@test.com", role: "member", canSendMessages: true, mutedUntil: null, joinedAt: new Date(), conversationId: "c1" },
            { userId: "u2", username: "user2", email: "user2@test.com", role: "owner", canSendMessages: true, mutedUntil: null, joinedAt: new Date(), conversationId: "c1" }
        ];
        participantRepo.getParticipants.mockResolvedValue({
            items: participants,
            nextCursor: "cursor2"
        });
        cacheService.remember.mockImplementation(async (_key, _ttl, callback) => callback());
        const result = await useCase.getParticipantsUseCase(USER_ID, CONVERSATION_ID);
        expect(result.items).toHaveLength(2);
        expect(result.items[0].username).toBe("user1");
        expect(result.items[1].username).toBe("user2");
        expect(result.nextCursor).toBe("cursor2");
    });
});
