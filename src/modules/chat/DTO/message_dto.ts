

export type MessageDTO = {
    id: string,
    conversationId: string,
    senderId: string,
    senderUsername?: string,
    senderAvatarId?: string | null,
    content: string,
    isEdited: boolean,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}