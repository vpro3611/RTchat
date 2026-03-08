

export type MessageDTO = {
    id: string,
    conversationId: string,
    senderId: string,
    content: string,
    isEdited: boolean,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}