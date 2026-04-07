<script setup lang="ts">
import { computed, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { ChatStore } from "stores/chat_store"
import { UserApi } from "src/api/apis/user_api"
import { AuthStore } from "stores/auth_store"
import { UserCacheStore } from "stores/user_cache_store"
import AppAvatar from "components/AppAvatar.vue"
import type { CreateGroupChatResponse } from "src/api/types/create_group_chat_response"

const router = useRouter()
const route = useRoute()

const chats = computed(() => ChatStore.chats)

function getOpponentId(chat: { conversationType: string, userLow: string | null, userHigh: string | null }) {
  if (chat.conversationType === "group") return null
  if (!chat.userLow || !chat.userHigh) return null

  const me = AuthStore.user?.id
  if (!me) return null

  return chat.userLow === me ? chat.userHigh : chat.userLow
}

function getChatTitle(chat: { title: string, conversationType: string, userLow: string | null, userHigh: string | null }) {
  const opponentId = getOpponentId(chat)
  if (!opponentId) return chat.title

  const name = UserCacheStore.getUsername(opponentId)
  return name ?? chat.title
}

function getAvatarId(chat: CreateGroupChatResponse) {
  if (chat.conversationType === "group") return chat.avatarId
  const opponentId = getOpponentId(chat)
  return opponentId ? UserCacheStore.getAvatarId(opponentId) : null
}

function isOnline(chat: CreateGroupChatResponse) {
  if (chat.conversationType === "group") return false
  const opponentId = getOpponentId(chat)
  return opponentId ? UserCacheStore.isOnline[opponentId] : false
}

function formatLastMessageTime(dateString: string | null) {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
}

function getLastMessageDisplay(chat: CreateGroupChatResponse) {
  if (!chat.lastMessageSenderId && !chat.lastMessageContent) return "No messages"

  const senderId = chat.lastMessageSenderId
  const content = chat.lastMessageContent || "Voice message"
  if (!senderId) return content

  const isMe = senderId === AuthStore.user?.id
  const name = isMe ? "You" : UserCacheStore.getUsername(senderId) || "User"

  return `${name}: ${content}`
}

function openChat(chatId: string) {
  void router.push(`/chat/${chatId}`)
}

async function loadMoreChats() {
  if (!ChatStore.hasMore || ChatStore.isLoading) return

  ChatStore.isLoading = true

  try {
    const res = await UserApi.getUserConversations({
      limit: 20,
      ...(ChatStore.nextCursor && { cursor: ChatStore.nextCursor })
    })

    ChatStore.appendChats(res.items, res.nextCursor)
  } finally {
    ChatStore.isLoading = false
  }
}

const userIdsToFetch = computed(() => {
  const ids = new Set<string>()
  ChatStore.chats.forEach(chat => {
    const oppId = getOpponentId(chat)
    if (oppId) ids.add(oppId)
    if (chat.lastMessageSenderId) ids.add(chat.lastMessageSenderId)
  })
  return Array.from(ids)
})

watch(
  userIdsToFetch,
  (ids) => {
    void UserCacheStore.ensureUsers(ids)
  },
  { immediate: true }
)
</script>

<template>
  <q-list separator>

    <q-item
      v-for="chat in chats"
      :key="chat.id"
      clickable
      @click="openChat(chat.id)"
      :active="route.params.id === chat.id"
      active-class="chat-item-active"
    >
      <q-item-section avatar>
        <AppAvatar
          :avatar-id="getAvatarId(chat)"
          :name="getChatTitle(chat)"
          :is-online="isOnline(chat)"
          size="48px"
        />
      </q-item-section>

      <q-item-section>
        <div class="row no-wrap items-center justify-between">
          <div class="text-subtitle1 text-weight-bold ellipsis col">{{ getChatTitle(chat) }}</div>
          <div class="text-caption text-grey q-ml-sm">{{ formatLastMessageTime(chat.lastMessageAt ?? chat.createdAt) }}</div>
        </div>
        <div class="row no-wrap items-center justify-between">
          <q-item-label caption lines="1" class="text-grey col">
            {{ getLastMessageDisplay(chat) }}
          </q-item-label>
          <q-badge
            v-if="chat.unreadCount > 0"
            color="primary"
            rounded
            class="q-ml-sm"
          >
            {{ chat.unreadCount }}
          </q-badge>
        </div>
      </q-item-section>

    </q-item>

  </q-list>

  <div class="q-pa-md flex flex-center">
    <q-btn
      v-if="ChatStore.hasMore"
      :loading="ChatStore.isLoading"
      label="Load more"
      flat
      @click="loadMoreChats"
    />
  </div>
</template>

<style scoped>
.chat-item-active {
  background: rgba(0, 0, 0, 0.05);
}

.body--dark .chat-item-active {
  background: rgba(255, 255, 255, 0.1);
}
</style>
