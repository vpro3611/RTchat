import {Participant} from "../domain/participant/participant";
import {ParticipantDTO} from "../DTO/participant_dto";


export class MapToParticipantDto {
    mapToParticipantDto(participant: Participant): ParticipantDTO {
        const mutedUntil = participant.getMutedUntil();
        const joinedAt = participant.getJoinedAt();
        
        return {
            conversationId: participant.getConversationId(),
            userId: participant.userId,
            role: participant.getRole(),
            canSendMessages: participant.getCanSendMessages(),
            mutedUntil: mutedUntil instanceof Date ? mutedUntil.toISOString() : mutedUntil,
            joinedAt: joinedAt instanceof Date ? joinedAt.toISOString() : joinedAt,
        }
    }
}