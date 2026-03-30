import {fetchJson} from "src/api/fetch/generinc_fetcher";
import {BaseUrl} from "src/base_url/base_url";
import {AuthStore} from "stores/auth_store";
import type {User} from "src/api/types/register_response";
import type {CreateGroupChatResponse} from "src/api/types/create_group_chat_response";
import type {CreateChatResponse} from "src/api/types/create_chat_response";


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
    },

    updateGroupConversationTitle(title: string, conversationId: string)
    {
      return fetchJson<CreateGroupChatResponse>(`${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/title`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({title}),
      })
    },

    leaveGroupConversation(conversationId: string)
    {
      // conversation/:conversationId/leave
      return fetchJson<void>(`${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/leave`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        }
      })
    },

    searchConversations(query: string, cursor?: string, limit = 20)
    {
      const queryParams = new URLSearchParams({
        query,
        limit: limit.toString(),
      });

      if (cursor) {
        queryParams.append('cursor', cursor);
      }

      return fetchJson<{items: CreateGroupChatResponse[], nextCursor: string}>(`${BaseUrl.apiBaseUrl}/private/search-conversations?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      })
    },

    searchUsers(query: string, cursor?: string, limit = 20)
    {
      const queryParams = new URLSearchParams({
        query,
        limit: limit.toString(),
      })

      if (cursor) {
        queryParams.append('cursor', cursor);
      }

      return fetchJson<{items: User[], nextCursor: string}>(`${BaseUrl.apiBaseUrl}/private/search-users?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      })
    },

    getSpecificUser(targetId: string)
    {
      return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/user/${targetId}/view`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      })
    },

    getSpecificConversation(conversationId: string)
    {
      return fetchJson<CreateGroupChatResponse>(`${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/view`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      })
    },

    createDirectConversation(targetId: string)
    {
      // "/direct-conv/:targetId/create",
      return fetchJson<CreateChatResponse>(`${BaseUrl.apiBaseUrl}/private/direct-conv/${targetId}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      });
    },
    resendChangeEmailVerification() {
      return fetchJson<{ok: boolean}>(`${BaseUrl.apiBaseUrl}/private/resend-change-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        }
      })
    },
    blockUser(targetId: string) {
      return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/user/${targetId}/block_user`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        }
      })
    },

    unblockUser(targetId: string) {
      return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/user/${targetId}/unblock_user`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        }
      })
    },

    getBlacklist(): Promise<User[]> {
      return fetchJson<User[]>(`${BaseUrl.apiBaseUrl}/private/user/black_list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      }).then(data => {
        // Явный cast на случай если бэкенд вернёт обёртку
        if (data && typeof data === 'object' && 'items' in data) {
          return (data as { items: User[] }).items;
        }
        return data;
      });
    },

    setUserAvatar(file: File)
    {
      const formData = new FormData();
      formData.append('avatar', file);

      return fetchJson<{avatarId: string}>(`${BaseUrl.apiBaseUrl}/private/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: formData,
      });
    },

    deleteUserAvatar()
    {
      return fetchJson<void>(`${BaseUrl.apiBaseUrl}/private/me/avatar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
      });
    }
  }
