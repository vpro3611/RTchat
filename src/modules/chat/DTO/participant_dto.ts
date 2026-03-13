

export type ParticipantDTO = {
    conversationId: string,
    userId: string,
    role: string,
    canSendMessages: boolean,
    mutedUntil: Date | null,
    joinedAt: Date,
}