import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {UserNotFoundError} from "../../../users/errors/use_case_errors";


export class GetSpecificParticipantUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private actorIsParticipant = async (conversationId: string, actorId: string) => {
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }

    async getSpecificParticipantUseCase(actorId: string, conversationId: string, targetId: string) {
        const cacheKey = `participant:conv:${conversationId}:user:${targetId}`;

        await this.actorIsParticipant(conversationId, actorId);

        return this.cacheService.remember(
            cacheKey,
            60,
            async () => {
                const result = await this.participantRepo.getSpecificParticipant(conversationId, targetId);
                if (!result) {
                    throw new UserNotFoundError("User is not a member of the conversation or user not found");
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
            }
        )
    }
}