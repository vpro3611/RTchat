import {Participant} from "../participant/participant";
import {FullParticipantDto} from "../../DTO/full_participant_dto";
import {ParticipantListDTO} from "../../DTO/participant_list_dto";


export interface ParticipantRepoInterface {
    save(participant: Participant): Promise<void>;
    remove(conversationId: string, userId: string): Promise<void>;
    findParticipant(conversationId: string, userId: string): Promise<Participant | null>;
    exists(conversationId: string, userId: string): Promise<boolean>;
    getParticipants(conversationId: string, limit?: number, cursor?: string): Promise<{items: ParticipantListDTO[], nextCursor?: string}>;
    getSpecificParticipant(conversationId: string, userId: string): Promise<FullParticipantDto | null>;
    getOldestParticipantNotOwner(conversationId: string, actorId: string): Promise<Participant | null>;
    getOwners(conversationId: string): Promise<Participant[]>;
}