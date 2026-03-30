export type ParticipantListDTO = {
  conversationId: string;
  userId: string;
  username: string;
  email: string;
  avatarId: string | null;
  role: string;
  canSendMessages: boolean;
  mutedUntil: Date | null;
  joinedAt: Date;
};
