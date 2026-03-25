

export type ParticipantDTO = {
    conversationId: string,
    userId: string,
    role: string,
    canSendMessages: boolean,
    mutedUntil: string | null,
    joinedAt: string,
}