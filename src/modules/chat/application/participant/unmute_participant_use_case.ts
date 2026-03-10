import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {
    ActorIsNotParticipantError,
    InsufficientPermissionsError
} from "../../errors/participants_errors/participant_errors";
import {ParticipantRole} from "../../domain/participant/participant_role";
import {Participant} from "../../domain/participant/participant";
import {ParticipantDTO} from "../../DTO/participant_dto";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class UnmuteParticipantUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly participantMapper: MapToParticipantDto,
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
            throw new ActorIsNotParticipantError("User is not a member of the conversation");
        }
        return target
    }

    private enforceRules(actor: Participant, target: Participant) {
        if (actor.getRole() !== ParticipantRole.OWNER) {
            throw new InsufficientPermissionsError("Actor is not an owner of the conversation");
        }
    }

    private async invalidateParticipantsCache(conversationId: string) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
    }

    async unmuteParticipantUseCase(actorId: string, targetId: string, conversationId: string): Promise<ParticipantDTO> {
        const actor = await this.actorIsParticipant(conversationId, actorId);

        const target = await this.targetIsParticipant(conversationId, targetId);

        this.enforceRules(actor, target);

        target.unmute();

        await this.participantRepo.save(target);

        await this.invalidateParticipantsCache(conversationId);

        return this.participantMapper.mapToParticipantDto(target);
    }
}