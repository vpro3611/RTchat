import {fetchJson} from "src/api/fetch/generinc_fetcher";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import type {ParticipantsResponse, ParticipantResponse, MuteDuration, ParticipantRole, ParticipantDTO} from "src/api/types/participant_response";
import type {ConversationBansFrontend} from "src/api/types/conversation_bans_response";
import type {ConversationRequestsStatusFrontend} from "src/api/types/request_status";
import type {ConversationRequestsResponse} from "src/api/types/conversation_request_response";
import type {FrontendSavedMessageDTO} from "src/api/types/saved_message_type";

export const ParticipantApi = {
  // Получить список участников
  getParticipants(conversationId: string, cursor?: string, limit = 50) {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
    });

    if (cursor) {
      queryParams.append('cursor', cursor);
    }

    return fetchJson<ParticipantsResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/participants?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // Получить полную информацию об участнике
  getSpecificParticipant(conversationId: string, targetId: string) {
    return fetchJson<ParticipantResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/get-full`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // Присоединиться к беседе
  joinConversation(conversationId: string) {
    return fetchJson<ConversationRequestsResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // Изменить роль участника
  changeRole(conversationId: string, targetId: string, role: ParticipantRole) {
    return fetchJson<ParticipantDTO>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/role`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({role}),
      }
    );
  },

  // Заглушить участника
  muteParticipant(conversationId: string, targetId: string, duration: MuteDuration) {
    return fetchJson<ParticipantDTO>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/mute`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({duration}),
      }
    );
  },

  // Разглушить участника
  unmuteParticipant(conversationId: string, targetId: string) {
    return fetchJson<ParticipantDTO>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/unmute`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // Удалить участника из беседы (kick)
  kickParticipant(conversationId: string, targetId: string) {
    return fetchJson<void>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/kick`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // unban a specific participant from a group conversation
  unbanGroupParticipant(conversationId: string, targetId: string) {
    return fetchJson<void>(
      // /conversation/:conversationId/:targetId/unban
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/unban`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  banGroupParticipant(conversationId: string, targetId: string, reason: string) {
    // /conversation/:conversationId/:targetId/ban
    return fetchJson<ConversationBansFrontend>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/ban`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({reason}),
      }
    )
  },
  getBannedParticipantsList(conversationId: string) {
    return fetchJson<ConversationBansFrontend[]>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/ban_list`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  changeConversationRequestStatus(
    conversationId: string,
    requestId: string,
    status: ConversationRequestsStatusFrontend,
    reviewMessage: string
  ) {
    // /conversation/:conversationId/requests/:requestId/status
    return fetchJson<ConversationRequestsResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/requests/${requestId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({status, reviewMessage}),
      }
    )
  },

  createConversationRequest(conversationId: string, requestMessage: string) {
    // /conversation/:conversationId/requests/create
    return fetchJson<ConversationRequestsResponse>(`${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/requests/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AuthStore.accessToken}`
      },
      body: JSON.stringify({requestMessage}),
    })
  },

  getAllRequestsListConv(conversationId: string, status?: ConversationRequestsStatusFrontend) {
    const query = new URLSearchParams();
    if (status) {
      query.append('status', status);
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    // /conversation/:conversationId/requests/get_all
    return fetchJson<ConversationRequestsResponse[]>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/requests/get_all${qs}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  getSpecificRequestGroup(conversationId: string, requestId: string) {
    // /conversation/:conversationId/requests/:requestId/view
    return fetchJson<ConversationRequestsResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/requests/${requestId}/view`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  getSpecificRequestUser(requestId: string) {
    // /private_requests/:requestId/view
    return fetchJson<ConversationRequestsResponse>(
      `${BaseUrl.apiBaseUrl}/private/private_requests/${requestId}/view`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  getRequestsUserList(status?: ConversationRequestsStatusFrontend) {
    const query = new URLSearchParams();
    if (status) {
      query.append('status', status);
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    // private_requests/view_all
    return fetchJson<ConversationRequestsResponse[]>(
      `${BaseUrl.apiBaseUrl}/private/private_requests/view_all${qs}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  removeRequestUser(requestId: string) {
    // /private_requests/:requestId/remove PATCH

    return fetchJson<void>(
      `${BaseUrl.apiBaseUrl}/private/private_requests/${requestId}/remove`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  withdrawRequestUser(requestId: string) {
    // /private_requests/:requestId/withdraw PATCH

    return fetchJson<ConversationRequestsResponse>(
      `${BaseUrl.apiBaseUrl}/private/private_requests/${requestId}/withdraw`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  addParticipantToGroup(conversationId: string, targetId: string) {
    // conversation/:conversationId/:targetId/force_add
    return fetchJson<ParticipantDTO>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/force_add`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  setConversationAvatar(conversationId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return fetchJson<{avatarId: string}>(`${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AuthStore.accessToken}`
      },
      body: formData,
    });
  },

  deleteConversationAvatar(conversationId: string) {
    return fetchJson<void>(`${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/avatar`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AuthStore.accessToken}`
      },
    });
  },

  saveMessage(conversationId: string, messageId: string) {
    // /conversation/:conversationId/:messageId/save
    return fetchJson<FrontendSavedMessageDTO>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${messageId}/save`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  removeSavedMessage(messageId: string) {
    // /user/saved_messages/:messageId/remove"
    return fetchJson<void>(
      `${BaseUrl.apiBaseUrl}/private/user/saved_messages/${messageId}/remove`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  getSpecificSavedMessage(messageId: string) {
    // "/user/saved_messages/:messageId/view"
    return fetchJson<FrontendSavedMessageDTO>(
      `${BaseUrl.apiBaseUrl}/private/user/saved_messages/${messageId}/view`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  },

  getSavedMessagesList(limit = 20, cursor?: string) {
    const queryParams = new URLSearchParams();

    queryParams.append('limit', limit.toString());

    if (cursor) {
      queryParams.append('cursor', cursor);
    }
    // /user/saved_messages/all
    return fetchJson<{items: FrontendSavedMessageDTO[], nextCursor?: string}>(
      `${BaseUrl.apiBaseUrl}/private/user/saved_messages/all?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    )
  }

};
