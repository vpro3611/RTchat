import {Participant} from "../participant/participant";


export interface ParticipantRepoInterface {
    save(participant: Participant): Promise<void>;
    remove(conversationId: string, userId: string): Promise<void>;
    findParticipant(conversationId: string, userId: string): Promise<Participant | null>;
    exists(conversationId: string, userId: string): Promise<boolean>;
    getParticipants(conversationId: string, limit?: number, cursor?: string): Promise<{items: Participant[], nextCursor?: string}>;
}