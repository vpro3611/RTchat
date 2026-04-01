import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ActorIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class LeaveConversationUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async actorIsParticipant(conversationId: string, actorId: string){
        const exists = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!exists) {
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return exists;
    }

    private async invalidateParticipantsCache(conversationId: string, newOwnerId: string | null) {
        await this.cacheService.delByPattern(`participants:conv:${conversationId}:*`);
        if (newOwnerId) {
            await this.cacheService.del(`participant:conv:${conversationId}:user:${newOwnerId}`);
        }
    }

    private async invalidateUserConversations(userId: string) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }

    async leaveConversationUseCase(actorId: string, conversationId: string): Promise<string | null> {
        const leaver = await this.actorIsParticipant(conversationId, actorId);
        
        let newOwnerId: string | null = null;

        if (leaver.getRole() === 'owner') {
            const owners = await this.participantRepo.getOwners(conversationId);
            
            // If the leaver is the only owner, try to transfer ownership
            if (owners.length === 1) {
                const candidate = await this.participantRepo.getOldestParticipantNotOwner(conversationId, actorId);
                if (candidate) {
                    candidate.changeRole(leaver, candidate);
                    await this.participantRepo.save(candidate);
                    newOwnerId = candidate.userId;
                }
            }
        }

        await this.participantRepo.remove(conversationId, actorId);

        await this.invalidateParticipantsCache(conversationId, newOwnerId);
        await this.invalidateUserConversations(actorId);

        return newOwnerId;
    }
}