import {fetchJson} from "src/api/fetch/generinc_fetcher";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import type {User} from "src/api/types/register_response";
import type {CreateGroupChatResponse} from "src/api/types/create_group_chat_response";


export const UserApi =
  {
    changePassword(oldPassword: string, newPassword: string)
    {
      return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({oldPassword, newPassword}),
      });
    },

    changeUsername(newUsername: string)
    {
      return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/change-username`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({newUsername}),
      });
    },

    changeEmail(newEmail: string)
    {
      return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/change-email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({newEmail}),
      });
    },

    toggleStatus()
    {
      return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      });
    },

    createGroupConversation(title: string)
    {
      return fetchJson<CreateGroupChatResponse>(`${BaseUrl.apiBaseUrl}/private/group-conv/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({title}),
      });
    },

    getUserConversations(params: {
      limit?: number,
      cursor?: string,
    }) {
      const queryParams = new URLSearchParams();

      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      if (params.cursor) {
        queryParams.append('cursor', params.cursor);
      }

      return fetchJson<{items: CreateGroupChatResponse[], nextCursor: string}>(`${BaseUrl.apiBaseUrl}/private/conversations?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      })
    }

    // createDirectConversation()
    // {
    //   return fetchJson<>(`${BaseUrl.apiBaseUrl}/private/create-direct-conversation`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${AuthStore.accessToken}`
    //     },
    //   });
    // }
  }
