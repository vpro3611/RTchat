import {fetchJson} from "src/api/fetch/generinc_fetcher";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import type {ParticipantsResponse, ParticipantResponse, MuteDuration, ParticipantRole} from "src/api/types/participant_response";

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
    return fetchJson<ParticipantResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // Покинуть беседу (возвращает 204, без тела)
  leaveConversation(conversationId: string) {
    return fetchJson<void>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/leave`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  // Изменить роль участника
  changeRole(conversationId: string, targetId: string, role: ParticipantRole) {
    return fetchJson<ParticipantResponse>(
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
    return fetchJson<ParticipantResponse>(
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
    return fetchJson<ParticipantResponse>(
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
  }
};
