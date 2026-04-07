import {reactive} from "vue";
import type {CreateGroupChatResponse} from "src/api/types/create_group_chat_response";
import { AuthStore } from "stores/auth_store";


export const ChatStore = reactive({
  chats: [] as CreateGroupChatResponse[],
  isBootstrapping: true,
  isLoading: false,
  nextCursor: null as string | null,
  hasMore: true,
  typingStatuses: {} as Record<string, Set<string>>,
  typingTimeouts: {} as Record<string, Record<string, NodeJS.Timeout>>,

  setChats(chats: CreateGroupChatResponse[], cursor: string | null) {
    this.chats = chats;
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  clearChats() {
    this.chats = [];
    this.nextCursor = null;
    this.hasMore = true;
    this.isLoading = false;
    this.isBootstrapping = true;
  },

  appendChats(chats: CreateGroupChatResponse[], cursor: string | null) {
    this.chats.push(...chats);
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  addChat(chat: CreateGroupChatResponse) {
    if (this.chats.find(c => c.id === chat.id)) return;
    this.chats.unshift(chat);
  },

  bumpChat(chatId: string) {
    const index = this.chats.findIndex(c => c.id === chatId);
    if (index === -1) return;

    const [chat] = this.chats.splice(index, 1);
    if (chat) {
      this.chats.unshift(chat);
    }
  },

  removeChat(chatId: string) {
    const index = this.chats.findIndex(c => c.id === chatId);
    if (index !== -1) {
      this.chats.splice(index, 1);
    }
  },

  updateChat(updated: CreateGroupChatResponse) {
    const index = this.chats.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      this.chats[index] = updated;
    }
  },

  updateChatData(chatId: string, data: Partial<CreateGroupChatResponse>) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      if (data.title !== undefined) chat.title = data.title;
      if (data.avatarId !== undefined) chat.avatarId = data.avatarId;
      if (data.lastMessageContent !== undefined) chat.lastMessageContent = data.lastMessageContent;
      if (data.lastMessageSenderId !== undefined) chat.lastMessageSenderId = data.lastMessageSenderId;
      if (data.lastMessageAt !== undefined) chat.lastMessageAt = data.lastMessageAt;
    }
  },

  updateChatAvatar(chatId: string, avatarId: string | null) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.avatarId = avatarId;
    }
  },

  setLastMessage(chatId: string, content: string, senderId: string, date: string, currentViewingChatId?: string) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessageContent = content;
      chat.lastMessageSenderId = senderId;
      chat.lastMessageAt = date;
      this.bumpChat(chatId);
      
      // Increment unread if not currently viewing this chat AND we are not the sender
      if (chatId !== currentViewingChatId && senderId !== AuthStore.user?.id) {
        this.incrementUnread(chatId);
      }
    }
  },

  incrementUnread(chatId: string) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.unreadCount = (chat.unreadCount || 0) + 1;
    }
  },

  resetUnread(chatId: string) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.unreadCount = 0;
    }
  },

  findById(id: string) {
    return this.chats.find(c => c.id === id);
  },

  finishBootstrapping() {
    this.isBootstrapping = false;
  },

  setTyping(conversationId: string, userId: string) {
    if (!this.typingStatuses[conversationId]) {
      this.typingStatuses[conversationId] = new Set<string>();
    }
    this.typingStatuses[conversationId].add(userId);

    // Fallback timeout to prevent ghost typing indicators
    if (!this.typingTimeouts[conversationId]) {
      this.typingTimeouts[conversationId] = {};
    }
    if (this.typingTimeouts[conversationId][userId]) {
      clearTimeout(this.typingTimeouts[conversationId][userId]);
    }
    this.typingTimeouts[conversationId][userId] = setTimeout(() => {
      this.stopTyping(conversationId, userId);
    }, 5000);
  },

  stopTyping(conversationId: string, userId: string) {
    if (this.typingStatuses[conversationId]) {
      this.typingStatuses[conversationId].delete(userId);
    }
    if (this.typingTimeouts[conversationId]?.[userId]) {
      clearTimeout(this.typingTimeouts[conversationId][userId]);
      delete this.typingTimeouts[conversationId][userId];
    }
  },

  getTypingUsers(conversationId: string): string[] {
    const set = this.typingStatuses[conversationId];
    return set ? Array.from(set) : [];
  }
})
