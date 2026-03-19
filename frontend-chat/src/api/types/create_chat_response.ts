export interface CreateChatResponse {
  id: string,
  conversationType: string,
  title: string,
  createdBy: string,
  createdAt: string,
  lastMessageAt: string | null,
  userLow: string | null,
  userHigh: string | null,
}
