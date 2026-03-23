export type ParticipantListDTO = {
  conversationId: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  canSendMessages: boolean;
  mutedUntil: Date | null;
  joinedAt: Date;
};
