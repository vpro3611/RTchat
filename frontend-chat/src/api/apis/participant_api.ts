import {fetchJson} from "src/api/fetch/generinc_fetcher";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import type {ParticipantsResponse, ParticipantResponse} from "src/api/types/participant_response";

export const ParticipantApi = {
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

  joinConversation(conversationId: string) {
    return fetchJson<{ok: boolean}>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  leaveConversation(conversationId: string) {
    return fetchJson<{ok: boolean}>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/leave`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  changeRole(conversationId: string, targetId: string, role: 'admin' | 'member') {
    return fetchJson<{ok: boolean}>(
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

  muteParticipant(conversationId: string, targetId: string, duration: number) {
    return fetchJson<{ok: boolean}>(
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

  unmuteParticipant(conversationId: string, targetId: string) {
    return fetchJson<{ok: boolean}>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/${targetId}/unmute`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }
    );
  },

  kickParticipant(conversationId: string, targetId: string) {
    return fetchJson<{ok: boolean}>(
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
