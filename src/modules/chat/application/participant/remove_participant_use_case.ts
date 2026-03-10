import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ParticipantRole} from "../../domain/participant/participant_role";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError, UserIsNotParticipantError
} from "../../errors/participants_errors/participant_errors";
import {Participant} from "../../domain/participant/participant";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class RemoveParticipantUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly cacheService: CacheServiceInterface
    ) {}

    private async actorIsParticipant(conversationId: string, actorId: string){
        const actor = await this.participantRepo.findParticipant(conversationId, actorId);
        if (!actor) {
            throw new ActorIsNotParticipantError("Actor is not a member of the conversation");
        }
        return actor
    }

    private async targetIsParticipant(conversationId: string, targetId: string){
        const target = await this.participantRepo.findParticipant(conversationId, targetId);
        if (!target) {
            throw new UserIsNotParticipantError("User is not a member of the conversation");
        }
        return target
    }

    private checkActorRole(actor: Participant) {
        if (actor.getRole() !== ParticipantRole.OWNER) {
            throw new InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }

    private checkTargetRole(target: Participant) {
        if (target.getRole() === ParticipantRole.OWNER) {
            throw new InsufficientPermissionsError("Only a member can be removed from the conversation");
        }
    }

    private async invalidateParticipantsCache(conversationId: string) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
    }

    private async invalidateUserConversations(userId: string) {
        await this.cacheService.delByPattern(`conv:user:${userId}:*`);
    }

    async removeParticipantUseCase(actorId: string, conversationId: string, targetId: string): Promise<void> {
        const actor = await this.actorIsParticipant(conversationId, actorId);

        this.checkActorRole(actor);

        const target = await this.targetIsParticipant(conversationId, targetId);

        this.checkTargetRole(target);

        await this.participantRepo.remove(conversationId, targetId);

        await this.invalidateParticipantsCache(conversationId);

        await this.invalidateUserConversations(targetId);
    }
}