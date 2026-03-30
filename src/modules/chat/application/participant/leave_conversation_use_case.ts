import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class LeaveConversationUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async actorIsParticipant(conversationId: string, actorId: string){
        const exists = await this.participantRepo.exists(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
    }

    private async invalidateParticipantsCache(conversationId: string) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
    }

    private async invalidateUserConversations(userId: string) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }

    async leaveConversationUseCase(actorId: string, conversationId: string): Promise<void> {
        await this.actorIsParticipant(conversationId, actorId);

        await this.participantRepo.remove(conversationId, actorId);

        await Promise.all([
            await this.invalidateParticipantsCache(conversationId),
            await this.invalidateUserConversations(actorId)
        ]);

    }
}