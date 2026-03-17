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

  findById(id: string) {
    return this.chats.find(c => c.id === id);
  },

  finishBootstrapping() {
    this.isBootstrapping = false;
  }

})
