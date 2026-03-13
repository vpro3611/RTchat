

export type FullParticipantDto = {
    conversationId: string,
    userId: string,
    role: string,
    canSendMessages: boolean,
    mutedUntil: Date | null,
    joinedAt: Date,
    username: string,
    email: string,
    isActive: boolean,
    lastSeenAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
}