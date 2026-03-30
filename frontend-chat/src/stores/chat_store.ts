import {reactive} from "vue";
import type {CreateGroupChatResponse} from "src/api/types/create_group_chat_response";


export const ChatStore = reactive({
  chats: [] as CreateGroupChatResponse[],
  isBootstrapping: true,
  isLoading: false,
  nextCursor: null as string | null,
  hasMore: true,

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

  setLastMessage(chatId: string, content: string, senderId: string, date: string) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessageContent = content;
      chat.lastMessageSenderId = senderId;
      chat.lastMessageAt = date;
      this.bumpChat(chatId);
    }
  },

  findById(id: string) {
    return this.chats.find(c => c.id === id);
  },

  finishBootstrapping() {
    this.isBootstrapping = false;
  }

})
