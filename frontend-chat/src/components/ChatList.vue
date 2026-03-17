<script setup lang="ts">
import { computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { ChatStore } from "stores/chat_store"
import { UserApi } from "src/api/apis/user_api"

const router = useRouter()
const route = useRoute()

const chats = computed(() => ChatStore.chats)

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
</script>

<template>
  <q-list separator>

    <q-item
      v-for="chat in chats"
      :key="chat.id"
      clickable
      @click="openChat(chat.id)"
      :active="route.params.id === chat.id"
      active-class="bg-grey-9"
    >
      <q-item-section avatar>
        <q-avatar color="primary" text-color="white">
          {{ chat.title?.[0]?.toUpperCase() || "?" }}
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ chat.title }}</q-item-label>
        <q-item-label caption lines="1">
          {{ chat.lastMessageAt ?? "No messages" }}
        </q-item-label>
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
