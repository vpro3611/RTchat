export type FrontendSavedMessageDTO = {
  savedBy: string,
  messageId: string,
  conversationId: string,
  senderId: string,
  content: string,
  createdAt: string,
  updatedAt: string | null,
}
