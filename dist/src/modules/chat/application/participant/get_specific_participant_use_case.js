"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpecificParticipantUseCase = void 0;
const participant_errors_1 = require("../../errors/participants_errors/participant_errors");
const use_case_errors_1 = require("../../../users/errors/use_case_errors");
class GetSpecificParticipantUseCase {
    participantRepo;
    cacheService;
    constructor(participantRepo, cacheService) {
        this.participantRepo = participantRepo;
        this.cacheService = cacheService;
    }
    actorIsParticipant = async (conversationId, actorId) => {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new participant_errors_1.ActorIsNotParticipantError("User is not a member of the conversation");
        }
    };
    async getSpecificParticipantUseCase(actorId, conversationId, targetId) {
        const cacheKey = `participant:conv:${conversationId}:user:${targetId}`;
        await this.actorIsParticipant(conversationId, actorId);
        return this.cacheService.remember(cacheKey, 60, async () => {
            const result = await this.participantRepo.getSpecificParticipant(conversationId, targetId);
            if (!result) {
                throw new use_case_errors_1.UserNotFoundError("User is not a member of the conversation or user not found");
            }
            // Маппим даты в строки для фронтенда
            return {
                participant: {
                    conversationId: result.conversationId,
                    userId: result.userId,
                    username: result.username,
                    email: result.email,
                    role: result.role,
                    canSendMessages: result.canSendMessages,
                    mutedUntil: result.mutedUntil instanceof Date
                        ? result.mutedUntil.toISOString()
                        : result.mutedUntil,
                    joinedAt: result.joinedAt instanceof Date
                        ? result.joinedAt.toISOString()
                        : result.joinedAt,
                }
            };
        });
    }
}
exports.GetSpecificParticipantUseCase = GetSpecificParticipantUseCase;
