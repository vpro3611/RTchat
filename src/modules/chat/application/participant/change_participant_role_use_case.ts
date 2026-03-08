import {ParticipantRepoInterface} from "../../domain/ports/participant_repo_interface";
import {ParticipantDTO} from "../../DTO/participant_dto";
import {MapToParticipantDto} from "../../shared/map_to_participant_dto";
import {ActorIsNotParticipantError, UserIsNotParticipantError} from "../errors/participants_errors/participant_errors";


export class ChangeParticipantRoleUseCase {
    constructor(private readonly participantRepo: ParticipantRepoInterface,
                private readonly participantMapper: MapToParticipantDto) {}

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

    async changeParticipantRoleUseCase(actorId: string, conversationId: string, targetId: string): Promise<ParticipantDTO> {
        const actor = await this.actorIsParticipant(conversationId, actorId);

        const target = await this.targetIsParticipant(conversationId, targetId);

        target.changeRole(actor, target)

        await this.participantRepo.save(target);

        return this.participantMapper.mapToParticipantDto(target);
    }
}