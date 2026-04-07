import {io} from "socket.io-client";
import type {Socket} from "socket.io-client";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import {MessageStore} from "stores/message_store";
import {ChatStore} from "stores/chat_store";
import {ParticipantStore} from "stores/participant_store";
import {UserCacheStore} from "stores/user_cache_store";
import type {Message} from "src/api/types/message_response";
import type {Participant} from "src/api/types/participant_response";
import type {CreateGroupChatResponse} from "src/api/types/create_group_chat_response";
import {UserApi} from "src/api/apis/user_api";

import type {CreateChatResponse} from "src/api/types/create_chat_response";
import type {ConversationRequestsResponse} from "src/api/types/conversation_request_response";

type TypingCallback = (data: { conversationId: string; userId: string; username: string }) => void;
type ErrorCallback = (data: { message: string }) => void;

class ChatSocketService {
  private socket: Socket | null = null;
  private typingCallbacks: TypingCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private currentViewingChatId: string | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(BaseUrl.apiBaseUrl, {
      auth: {
        token: AuthStore.accessToken
      },
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  // Ждать подключения сокета
  async waitForConnection(timeout = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkConnection = () => {
        if (this.socket?.connected) {
          resolve(true);
          return;
        }
        if (Date.now() - startTime > timeout) {
          resolve(false);
          return;
        }
        setTimeout(checkConnection, 100);
      };

      // Если сокет ещё не создан, создаём и ждём
      if (!this.socket) {
        this.connect();
      }
      checkConnection();
    });
  }

  getSocket() {
    return this.socket;
  }

  setCurrentChat(chatId: string | null) {
    this.currentViewingChatId = chatId;
    if (chatId) {
      ChatStore.resetUnread(chatId);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Снимаем все старые слушатели перед установкой новых, чтобы избежать дубликатов
    this.socket.off();

    // Новое сообщение
    this.socket.on('message:new', (data: Message) => {
      MessageStore.addMessage(data);
      // Обновляем список чатов: поднимаем чат наверх и обновляем превью
      ChatStore.setLastMessage(data.conversationId, data.content, data.senderId, data.createdAt, this.currentViewingChatId || undefined);
    });

    // Сообщение отредактировано - бэкенд отправляет { message: MessageDTO }
    this.socket.on('message:edited', (data: { message: Message }) => {
      if (data.message) {
        MessageStore.updateMessage(data.message.id, data.message.content);
        // Если это последнее сообщение в чате, обновляем превью в списке
        const chat = ChatStore.findById(data.message.conversationId);
        if (chat && chat.lastMessageAt === data.message.createdAt) {
           chat.lastMessageContent = data.message.content;
        }
      }
    });

    // Сообщение удалено - бэкенд отправляет { message: MessageDTO }
    this.socket.on('message:deleted', (data: { message: Message }) => {
      if (data.message) {
        MessageStore.removeMessage(data.message.id);

        // Если это было последнее сообщение, нужно обновить превью в списке чатов
        const chat = ChatStore.findById(data.message.conversationId);
        if (chat && chat.lastMessageAt === data.message.createdAt) {
          void (async () => {
            try {
              const updatedChat = await UserApi.getSpecificConversation(data.message.conversationId);
              ChatStore.updateChatData(data.message.conversationId, {
                lastMessageContent: updatedChat.lastMessageContent,
                lastMessageSenderId: updatedChat.lastMessageSenderId,
                lastMessageAt: updatedChat.lastMessageAt
              });
            } catch (e) {
              console.error('Failed to update chat after message deletion:', e);
            }
          })();
        }
      }
    });

    // Сообщение прочитано
    this.socket.on('message:read', (data: { conversationId: string; messageId: string; userId: string; readAt: string }) => {
      console.log('Message read:', data);
      MessageStore.markMessagesAsRead(data.conversationId, data.userId, data.readAt);
      
      // Reset unread count if we are the one who read it (sync across our own devices)
      if (data.userId === AuthStore.user?.id) {
        ChatStore.resetUnread(data.conversationId);
      }
    });

    // Начало набора текста
    this.socket.on('typing:start', (data: { conversationId: string; userId: string; username: string }) => {
      this.typingCallbacks.forEach(cb => cb(data));
    });

    // Конец набора текста
    this.socket.on('typing:stop', (data: { conversationId: string; userId: string; username: string }) => {
      this.typingCallbacks.forEach(cb => cb(data));
    });

    // Ошибка сокета
    this.socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      this.errorCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('user:online', (data: { userId: string }) => {
      UserCacheStore.setStatus(data.userId, true);
    });

    this.socket.on('user:offline', (data: { userId: string }) => {
      UserCacheStore.setStatus(data.userId, false);
    });

    this.socket.on('user:online_list', (data: { userIds: string[] }) => {
      UserCacheStore.setOnlineUsers(data.userIds);
    });

    // --- Sync Events ---
    this.socket.on('participant:added', (data: { conversationId: string, participant: Participant }) => {
      ParticipantStore.addParticipant(data.participant);
    });

    this.socket.on('participant:removed', (data: { conversationId: string, userId: string }) => {
      ParticipantStore.removeParticipant(data.userId);
    });

    this.socket.on('participant:updated', (data: { conversationId: string, participant: Participant }) => {
      ParticipantStore.updateParticipant(data.participant.userId, data.participant);
    });

    this.socket.on('conversation:updated', (data: { conversationId: string, conversation: CreateGroupChatResponse }) => {
      ChatStore.updateChatData(data.conversationId, data.conversation);
    });

    this.socket.on('conversation:new', async (data: CreateChatResponse | { conversationId: string, participant: Participant }) => {
      const conversationId = 'id' in data ? data.id : data.conversationId;

      // Join the room for the new conversation to start receiving messages
      if (this.socket) {
        this.socket.emit('conversation:join', { conversationId });
      }

      try {
        // Fetch full conversation details and add to store
        const chat = await UserApi.getSpecificConversation(conversationId);
        ChatStore.addChat(chat);
        console.log('New conversation added to store:', chat);
      } catch (error) {
        console.error('Failed to fetch new conversation details:', error);
      }
    });

    this.socket.on('conversation:removed', (data: { conversationId: string }) => {
      console.log('Conversation removed:', data.conversationId);
      ChatStore.removeChat(data.conversationId);
    });

    this.socket.on('conversation:request_new', (data: { conversationId: string, request: ConversationRequestsResponse }) => {
      console.log('New join request received:', data);
      // Optional: Update request store if it exists globally
    });

    this.socket.on('conversation:request_status_changed', async (data: ConversationRequestsResponse) => {
      console.log('Join request status changed:', data);
      if (data.status === 'accepted') {
        if (this.socket) {
          this.socket.emit('conversation:join', { conversationId: data.conversationId });
        }
        try {
          const chat = await UserApi.getSpecificConversation(data.conversationId);
          ChatStore.addChat(chat);
        } catch (error) {
          console.error('Failed to fetch accepted conversation details:', error);
        }
      }
    });

    // Ошибка подключения
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(conversationId: string, content: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:send', { conversationId, content });
  }

  replyToMessage(conversationId: string, parentMessageId: string, content: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:reply', { conversationId, parentMessageId, content });
  }

  editMessage(conversationId: string, messageId: string, content: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:edit', { conversationId, messageId, newContent: content });
  }

  deleteMessage(conversationId: string, messageId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:delete', { conversationId, messageId });
  }

  markAsRead(conversationId: string, messageId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:read', { conversationId, messageId });
    ChatStore.resetUnread(conversationId);
  }

  startTyping(conversationId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:start', { conversationId });
  }

  stopTyping(conversationId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:stop', { conversationId });
  }

  onTyping(callback: TypingCallback) {
    this.typingCallbacks.push(callback);
  }

  offTyping(callback: TypingCallback) {
    const index = this.typingCallbacks.indexOf(callback);
    if (index !== -1) {
      this.typingCallbacks.splice(index, 1);
    }
  }

  onError(callback: ErrorCallback) {
    this.errorCallbacks.push(callback);
  }

  offError(callback: ErrorCallback) {
    const index = this.errorCallbacks.indexOf(callback);
    if (index !== -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const chatSocket = new ChatSocketService();
