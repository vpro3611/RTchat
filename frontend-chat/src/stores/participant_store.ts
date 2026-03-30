import {reactive} from "vue";
import type {Participant} from "src/api/types/participant_response";

export const ParticipantStore = reactive({
  participants: [] as Participant[],
  isLoading: false,
  nextCursor: null as string | null,
  hasMore: true,

  participantsMap: new Map<string, Participant>(),

  setParticipants(participants: Participant[], cursor: string | null) {
    this.participants = participants;
    this.participantsMap.clear();
    participants.forEach(p => this.participantsMap.set(p.userId, p));
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  appendParticipants(participants: Participant[], cursor: string | null) {
    this.participants.push(...participants);
    participants.forEach(p => this.participantsMap.set(p.userId, p));
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  clearParticipants() {
    this.participants = [];
    this.participantsMap.clear();
    this.nextCursor = null;
    this.hasMore = true;
    this.isLoading = false;
  },

  addParticipant(participant: Participant) {
    if (this.participantsMap.has(participant.userId)) return;
    this.participants.push(participant);
    this.participantsMap.set(participant.userId, participant);
  },

  removeParticipant(userId: string) {
    const index = this.participants.findIndex(p => p.userId === userId);
    if (index !== -1) {
      this.participants.splice(index, 1);
      this.participantsMap.delete(userId);
    }
  },

  updateParticipant(userId: string, updates: Partial<Participant>) {
    const participant = this.participantsMap.get(userId);
    if (participant) {
      Object.assign(participant, updates);
    }
  },

  findById(userId: string) {
    return this.participantsMap.get(userId);
  },

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }
});
