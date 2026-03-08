import {Participant} from "../domain/participant/participant";
import {ParticipantDTO} from "../DTO/participant_dto";


export class MapToParticipantDto {
    mapToParticipantDto(participant: Participant): ParticipantDTO {
        return {
            conversationId: participant.getConversationId(),
            userId: participant.userId,
            role: participant.getRole(),
            canSendMessages: participant.getCanSendMessages(),
            mutedUntil: participant.getMutedUntil(),
            joinedAt: participant.getJoinedAt(),
        }
    }
}