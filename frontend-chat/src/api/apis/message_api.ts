import {fetchJson} from "src/api/fetch/generinc_fetcher";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import type {MessagesResponse, SendMessageResponse, EditMessageResponse, DeleteMessageResponse, Message} from "src/api/types/message_response";

export const MessageApi = {
  getMessages(conversationId: string, cursor?: string, limit = 50) {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
    });

    if (cursor) {
      queryParams.append('cursor', cursor);
    }

    return fetchJson<MessagesResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/messages?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  getSpecificMessage(conversationId: string, messageId: string) {
    return fetchJson<{message: Message}>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${messageId}/view`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  sendMessage(conversationId: string, content: string) {
    return fetchJson<SendMessageResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({content}),
      }
    );
  },

  sendMessageWithFiles(conversationId: string, content: string, files: File[]) {
    const formData = new FormData();
    formData.append('content', content);
    files.forEach(file => {
      formData.append('files', file);
    });

    return fetchJson<SendMessageResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: formData,
      }
    );
  },

  editMessage(conversationId: string, messageId: string, content: string) {
    return fetchJson<EditMessageResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${messageId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({content}),
      }
    );
  },

  deleteMessage(conversationId: string, messageId: string) {
    return fetchJson<DeleteMessageResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${messageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // Mark messages as read
  markAsRead(conversationId: string) {
    return fetchJson<{ok: boolean}>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/read`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  resendMessage(sourceConversationId: string, messageId: string, targetConversationId: string) {
    return fetchJson<Message>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${sourceConversationId}/messages/${messageId}/resend`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({targetConversationId}),
      }
    );
  }
};
