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
import AppAvatar from "components/AppAvatar.vue"
import type {CreateChatResponse} from "src/api/types/create_chat_response";

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

function getAvatarId(chat: CreateChatResponse) {
  if (chat.conversationType === "group") return chat.avatarId
  const opponentId = getOpponentId(chat)
  return opponentId ? UserCacheStore.getAvatarId(opponentId) : null
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
  <div class="search-discovery-container">

    <q-input
      v-model="query"
      placeholder="Search for groups or people..."
      outlined
      dense
      class="q-mb-md discovery-search-input"
    >
      <template v-slot:prepend>
        <q-icon name="explore" color="primary" />
      </template>
    </q-input>

    <!--  показываем результаты только при поиске -->
    <div v-if="SearchStore.query">

      <q-infinite-scroll
        @load="loadMore"
        :offset="100"
        :disable="!SearchStore.hasMore"
        class="discovery-scroll-area"
      >
        <div class="q-gutter-y-sm q-pb-md">
          <q-card
            v-for="chat in SearchStore.items"
            :key="chat.id"
            class="discovery-result-card shadow-1 transition-all"
            :class="{ 'member-card': isMember(chat.id) }"
            @click="isMember(chat.id) && $router.push(`/chat/${chat.id}`)"
          >
            <q-item class="q-pa-sm">
              <q-item-section avatar>
                <AppAvatar
                  :avatar-id="getAvatarId(chat)"
                  :name="getChatTitle(chat)"
                  size="44px"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold truncate-title">{{ getChatTitle(chat) }}</q-item-label>
                <q-item-label caption v-if="chat.conversationType === 'group'" class="row items-center">
                  <q-icon name="groups" size="14px" class="q-mr-xs" />
                  Group
                </q-item-label>
                <q-item-label caption v-else class="row items-center">
                  <q-icon name="person" size="14px" class="q-mr-xs" />
                  User
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="chat.conversationType === 'group'">
                <template v-if="!isMember(chat.id)">
                  <q-btn
                    v-if="!hasPendingRequest(chat.id)"
                    label="Join"
                    color="primary"
                    unelevated
                    dense
                    padding="2px 12px"
                    @click.stop="handleJoin(chat)"
                    class="rounded-borders text-caption text-weight-bold"
                  />
                  <q-badge v-else color="orange" label="Pending" class="q-pa-xs" rounded />
                </template>
                <q-badge v-else color="positive" class="q-pa-xs" rounded>
                  <q-icon name="check" class="q-mr-xs" size="12px" />
                  Member
                </q-badge>
              </q-item-section>
            </q-item>
          </q-card>
        </div>

        <div v-if="SearchStore.isLoading" class="text-center q-pa-md">
          <q-spinner-dots color="primary" size="30px" />
        </div>

        <div v-if="!SearchStore.isLoading && SearchStore.items.length === 0"
             class="text-center q-pa-xl column items-center text-grey-6">
          <q-icon name="travel_explore" size="48px" class="q-mb-sm" />
          <div class="text-weight-medium">Nothing found</div>
          <div class="text-caption">Try a different name</div>
        </div>

      </q-infinite-scroll>

    </div>

  </div>
</template>

<style scoped>
.discovery-search-input :deep(.q-field__control) {
  border-radius: 10px;
}

.discovery-result-card {
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: default;
}

.body--dark .discovery-result-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.member-card {
  cursor: pointer !important;
}

.discovery-result-card:hover {
  border-color: var(--q-primary);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.truncate-title {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.discovery-scroll-area {
  max-height: calc(100vh - 120px);
}
</style>
