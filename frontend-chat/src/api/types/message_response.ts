export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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
