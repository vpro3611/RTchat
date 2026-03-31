export interface CreateGroupChatResponse {
  id: string,
  conversationType: string,
  title: string,
  avatarId: string | null,
  createdBy: string,
  createdAt: string,
  lastMessageAt: string | null,
  userLow: string | null,
  userHigh: string | null,
  lastMessageContent?: string | undefined,
  lastMessageSenderId?: string | undefined,
  unreadCount: number,
}
