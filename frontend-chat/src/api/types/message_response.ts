import type { Attachment } from "./attachment";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  senderUsername?: string;
  senderAvatarId?: string | null;
  isResent: boolean;
  originalSenderId?: string;
  isRead: boolean;
  attachments: Attachment[];
}

export interface MessagesResponse {
  items: Message[];
  nextCursor: string | null;
}

export interface SendMessageResponse {
  message: Message;
}

export interface EditMessageResponse {
  message: Message;
}

export interface DeleteMessageResponse {
  message: string;
}
