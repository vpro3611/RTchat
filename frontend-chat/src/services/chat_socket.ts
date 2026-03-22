import {io} from "socket.io-client";
import type {Socket} from "socket.io-client";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import {MessageStore} from "stores/message_store";
import type {Message} from "src/api/types/message_response";

type TypingCallback = (data: { conversationId: string; userId: string; username: string }) => void;

class ChatSocketService {
  private socket: Socket | null = null;
  private typingCallbacks: TypingCallback[] = [];

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

  private setupEventListeners() {
    if (!this.socket) return;

    // Новое сообщение
    this.socket.on('message:new', (data: Message) => {
      MessageStore.addMessage(data);
    });

    // Сообщение отредактировано - бэкенд отправляет { message: MessageDTO }
    this.socket.on('message:edited', (data: { message: Message }) => {
      if (data.message) {
        MessageStore.updateMessage(data.message.id, data.message.content);
      }
    });

    // Сообщение удалено - бэкенд отправляет { message: MessageDTO }
    this.socket.on('message:deleted', (data: { message: Message }) => {
      if (data.message) {
        MessageStore.removeMessage(data.message.id);
      }
    });

    // Сообщение прочитано
    this.socket.on('message:read', (data: { conversationId: string; messageId: string; userId: string }) => {
      // Можно обновить статус прочтения в UI
      console.log('Message read:', data);
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

  // Отправить сообщение через WebSocket
  sendMessage(conversationId: string, content: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('message:send', { conversationId, content });
  }

  // Редактировать сообщение
  editMessage(conversationId: string, messageId: string, newContent: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('message:edit', { conversationId, messageId, newContent });
  }

  // Удалить сообщение
  deleteMessage(conversationId: string, messageId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('message:delete', { conversationId, messageId });
  }

  // Отметить сообщения как прочитанные
  markAsRead(conversationId: string, messageId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('message:read', { conversationId, messageId });
  }

  // Начало набора текста
  startTyping(conversationId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:start', { conversationId });
  }

  // Конец набора текста
  stopTyping(conversationId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:stop', { conversationId });
  }

  // Подписаться на события набора текста
  onTyping(callback: TypingCallback) {
    this.typingCallbacks.push(callback);
  }

  // Отписаться от событий набора текста
  offTyping(callback: TypingCallback) {
    const index = this.typingCallbacks.indexOf(callback);
    if (index !== -1) {
      this.typingCallbacks.splice(index, 1);
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  getSocket() {
    return this.socket;
  }
}

export const chatSocket = new ChatSocketService();
