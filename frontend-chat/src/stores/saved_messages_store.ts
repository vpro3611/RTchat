import { reactive } from "vue"
import { ParticipantApi } from "src/api/apis/participant_api"
import type { FrontendSavedMessageDTO } from "src/api/types/saved_message_type"

export const SavedMessagesStore = reactive({
  messages: [] as FrontendSavedMessageDTO[],
  isLoading: false,
  nextCursor: null as string | null,
  hasMore: true,

  async fetchMessages(limit = 20) {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      const response = await ParticipantApi.getSavedMessagesList(limit);
      this.messages = response.items;
      this.nextCursor = response.nextCursor ?? null;
      this.hasMore = !!response.nextCursor;
    } finally {
      this.isLoading = false;
    }
  },

  async loadMore(limit = 20) {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    try {
      const response = await ParticipantApi.getSavedMessagesList(limit, this.nextCursor ?? undefined);
      this.messages.push(...response.items);
      this.nextCursor = response.nextCursor ?? null;
      this.hasMore = !!response.nextCursor;
    } finally {
      this.isLoading = false;
    }
  },

  async saveMessage(conversationId: string, messageId: string) {
    if (this.messages.some(m => m.messageId === messageId)) return;
    
    const savedMsg = await ParticipantApi.saveMessage(conversationId, messageId);
    // Add to the top of the list if it's not already there
    if (!this.messages.some(m => m.messageId === messageId)) {
      this.messages.unshift(savedMsg);
    }
    return savedMsg;
  },

  async removeMessage(messageId: string) {
    await ParticipantApi.removeSavedMessage(messageId);
    this.messages = this.messages.filter(m => m.messageId !== messageId);
  },

  clear() {
    this.messages = [];
    this.nextCursor = null;
    this.hasMore = true;
    this.isLoading = false;
  }
})
