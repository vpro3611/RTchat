export type ParticipantRole = 'owner' | 'member';

export interface Participant {
  conversationId: string;
  userId: string;
  username: string;
  email: string;
  role: ParticipantRole;
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

// Типы для mute
export type MuteDuration = '1h' | '8h' | '1d' | '1w' | 'forever';
