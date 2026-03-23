import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ParticipantDTO} from "../../DTO/participant_dto";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {ActorIsNotParticipantError, UserIsNotParticipantError} from "../../errors/participants_errors/participant_errors";
import {CacheServiceInterface} from "../../../infrasctructure/ports/cache_service/cache_service_interface";


export class ChangeParticipantRoleUseCase {
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
            throw new UserIsNotParticipantError("User is not a member of the conversation");
        }
        return target
    }

    private async invalidateParticipantCache(conversationId: string, targetId: string) {
        await this.cacheService.del(`participants:conv:${conversationId}`);
        await this.cacheService.del(`participant:conv:${conversationId}:user:${targetId}`);
    }

    async changeParticipantRoleUseCase(actorId: string, conversationId: string, targetId: string): Promise<ParticipantDTO> {
        const actor = await this.actorIsParticipant(conversationId, actorId);

        const target = await this.targetIsParticipant(conversationId, targetId);

        target.changeRole(actor, target)

        await this.participantRepo.save(target);

        await this.invalidateParticipantCache(conversationId, targetId);

        return this.participantMapper.mapToParticipantDto(target);
    }
}