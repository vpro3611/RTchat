<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { debounce } from "lodash"

import { SearchStore } from "stores/conversations_search_store"
import { UserApi } from "src/api/apis/user_api"
import { AuthStore } from "stores/auth_store"
import { UserCacheStore } from "stores/user_cache_store"
import { ChatStore } from "stores/chat_store"
import { ParticipantApi } from "src/api/apis/participant_api"
import { RequestStore } from "stores/request_store"
import { useQuasar } from "quasar"

const $q = useQuasar()
const query = ref("")

watch(query, debounce(async (val: string) => {
  if (!val || val.length < 2) {
    SearchStore.setQuery("")
    SearchStore.clear()
    return
  }

  SearchStore.setQuery(val)

  try {
    SearchStore.setLoading(true)

    const res = await UserApi.searchConversations(val)

    SearchStore.setResults(res.items, res.nextCursor ?? null)

  } finally {
    SearchStore.setLoading(false)
  }
}, 300))

async function loadMore(index: number, done: (stop?: boolean) => void) {
  if (!SearchStore.hasMore || SearchStore.isLoading) {
    done(true)
    return
  }

  try {
    SearchStore.setLoading(true)

    const res = await UserApi.searchConversations(
      SearchStore.query,
      SearchStore.nextCursor ?? undefined
    )

    SearchStore.appendResults(res.items, res.nextCursor ?? null)

    if (!res.nextCursor) {
      done(true)
    } else {
      done()
    }

  } catch {
    done(true)
  } finally {
    SearchStore.setLoading(false)
  }
}

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

function isMember(chatId: string) {
  return !!ChatStore.findById(chatId)
}

function hasPendingRequest(chatId: string) {
  return RequestStore.myRequests.some(r => r.conversationId === chatId && r.status === 'pending')
}

function handleJoin(chat: { id: string, title: string }) {
  $q.dialog({
    title: 'Join Group',
    message: `Do you want to join "${chat.title}"? You can also provide a custom message for the owner:`,
    prompt: {
      model: '',
      type: 'text',
      placeholder: 'Hello, I would like to join...'
    },
    cancel: true,
    persistent: true,
    ok: {
      label: 'Send Request',
      color: 'primary'
    }
  }).onOk((message: string) => {
    void (async () => {
      try {
        if (message && message.trim()) {
          await ParticipantApi.createConversationRequest(chat.id, message)
        } else {
          await ParticipantApi.joinConversation(chat.id)
        }
        
        $q.notify({
          type: 'positive',
          message: 'Join request sent successfully'
        })
        void RequestStore.fetchMyRequests()
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to send join request'
        })
      }
    })()
  })
}

watch(
  () => SearchStore.items,
  (list) => {
    const opponentIds = list.map(getOpponentId).filter(Boolean) as string[]
    void UserCacheStore.ensureUsers(opponentIds)
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  void RequestStore.fetchMyRequests()
})
</script>

<template>
  <div>

    <q-input
      v-model="query"
      label="Search conversations"
      outlined
      dense
      class="q-mb-md"
    />

    <!--  показываем результаты только при поиске -->
    <div v-if="SearchStore.query">

      <q-infinite-scroll
        @load="loadMore"
        :offset="100"
        :disable="!SearchStore.hasMore"
      >
        <q-list>

          <q-item
            v-for="chat in SearchStore.items"
            :key="chat.id"
            :clickable="isMember(chat.id)"
            @click="isMember(chat.id) && $router.push(`/chat/${chat.id}`)"
          >
            <q-item-section>
              <q-item-label>{{ getChatTitle(chat) }}</q-item-label>
              <q-item-label caption v-if="chat.conversationType === 'group'">
                Group Chat
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="chat.conversationType === 'group'">
              <template v-if="!isMember(chat.id)">
                <q-btn
                  v-if="!hasPendingRequest(chat.id)"
                  label="Join"
                  color="primary"
                  flat
                  dense
                  @click.stop="handleJoin(chat)"
                />
                <q-badge v-else color="orange" label="Pending" />
              </template>
              <q-badge v-else color="positive" label="Member" />
            </q-item-section>
          </q-item>

        </q-list>

        <div v-if="SearchStore.isLoading" class="text-center q-pa-md">
          Loading...
        </div>

        <div v-if="!SearchStore.isLoading && SearchStore.items.length === 0" class="text-center q-pa-md">
          No results
        </div>

      </q-infinite-scroll>

    </div>

  </div>
</template>
