
export type ConversationRequestsResponse = {
  id: string,
  conversationId: string,
  userId: string,
  status: string,
  requestMessage: string,
  submittedAt: string,
  reviewedAt: string | null,
  reviewedBy: string | null,
  reviewedMessage: string | null,
}
