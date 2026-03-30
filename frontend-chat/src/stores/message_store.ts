import {reactive} from "vue";
import type {Message} from "src/api/types/message_response";

export const MessageStore = reactive({
  messages: [] as Message[],
  isLoading: false,
  nextCursor: null as string | null,
  hasMore: true,
  isBootstrapping: true,

  // Map для быстрого доступа к сообщениям по ID
  messagesMap: new Map<string, Message>(),

  setMessages(messages: Message[], cursor: string | null) {
    // Фильтруем удалённые сообщения
    const activeMessages = messages.filter(msg => !msg.isDeleted);
    this.messages = activeMessages;
    this.messagesMap.clear();
    activeMessages.forEach(msg => this.messagesMap.set(msg.id, msg));
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  appendMessages(messages: Message[], cursor: string | null) {
    // Фильтруем удалённые сообщения
    const activeMessages = messages.filter(msg => !msg.isDeleted);
    this.messages.push(...activeMessages);
    activeMessages.forEach(msg => this.messagesMap.set(msg.id, msg));
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  clearMessages() {
    this.messages = [];
    this.messagesMap.clear();
    this.nextCursor = null;
    this.hasMore = true;
    this.isLoading = false;
    this.isBootstrapping = true;
  },

  addMessage(message: Message) {
    // Не добавляем удалённые сообщения
    if (message.isDeleted) return;
    // Проверяем, не дубликат ли это
    if (this.messagesMap.has(message.id)) return;
    this.messages.push(message);
    this.messagesMap.set(message.id, message);
  },

  updateMessage(messageId: string, content: string) {
    const message = this.messagesMap.get(messageId);
    if (message) {
      message.content = content;
      message.isEdited = true;
    }
  },

  removeMessage(messageId: string) {
    const index = this.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      this.messages.splice(index, 1);
      this.messagesMap.delete(messageId);
    }
  },

  findById(messageId: string) {
    return this.messagesMap.get(messageId);
  },

  finishBootstrapping() {
    this.isBootstrapping = false;
  },

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }
});
