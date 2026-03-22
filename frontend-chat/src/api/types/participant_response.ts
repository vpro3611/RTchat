export interface Participant {
  conversationId: string;
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  canSendMessages: boolean;
  mutedUntil: string | null;
  joinedAt: string;
}

export interface ParticipantsResponse {
  items: Participant[];
  nextCursor: string | null;
}

export interface ParticipantResponse {
  participant: Participant;
}
