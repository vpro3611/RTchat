<script setup lang="ts">
import { ref, computed } from "vue"
import { useQuasar } from "quasar"
import { UserApi } from "src/api/apis/user_api"
import { MessageApi } from "src/api/apis/message_api"
import AppAvatar from "./AppAvatar.vue"
import type { CreateGroupChatResponse } from "src/api/types/create_group_chat_response"

const props = defineProps<{
  messageId: string
  sourceConversationId: string
}>()

const $q = useQuasar()
const show = ref(false)
const query = ref("")
const isLoading = ref(false)
const conversations = ref<CreateGroupChatResponse[]>([])
const resendingIds = ref<Set<string>>(new Set())
const sentIds = ref<Set<string>>(new Set())

async function fetchConversations() {
  try {
    isLoading.value = true
    const res = await UserApi.getUserConversations({ limit: 100 })
    conversations.value = res.items
  } catch (e) {
    console.error(e)
    $q.notify({
      type: "negative",
      message: "Failed to load conversations"
    })
  } finally {
    isLoading.value = false
  }
}

async function handleResend(targetConversationId: string) {
  if (resendingIds.value.has(targetConversationId) || sentIds.value.has(targetConversationId)) return

  try {
    resendingIds.value.add(targetConversationId)
    await MessageApi.resendMessage(
      props.sourceConversationId,
      props.messageId,
      targetConversationId
    )
    
    sentIds.value.add(targetConversationId)
    
    $q.notify({
      type: "positive",
      message: "Message forwarded!",
      timeout: 1000,
      position: 'top'
    })
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Failed to forward message"
    $q.notify({
      type: "negative",
      message: errorMsg
    })
  } finally {
    resendingIds.value.delete(targetConversationId)
  }
}

const filteredConversations = computed(() => {
  const list = conversations.value.filter(c => c.id !== props.sourceConversationId)
  if (!query.value) {
    return list
  }
  const q = query.value.toLowerCase()
  return list.filter(c => 
    c.title.toLowerCase().includes(q)
  )
})

function open() {
  show.value = true
  query.value = ""
  sentIds.value.clear()
  void fetchConversations()
}

defineExpose({ open })
</script>

<template>
  <q-dialog v-model="show" transition-show="scale" transition-hide="scale">
    <q-card class="resend-dialog shadow-24">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold text-primary flex items-center">
          <q-icon name="forward" class="q-mr-sm" />
          Forward Message
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-input
          v-model="query"
          placeholder="Search conversations..."
          outlined
          dense
          autofocus
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
          <template v-slot:append v-if="query">
            <q-icon name="cancel" @click="query = ''" class="cursor-pointer" color="grey-5" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="q-pa-none scroll list-container">
        <q-list padding>
          <div v-if="isLoading" class="flex flex-center q-pa-xl">
            <q-spinner-tail color="primary" size="3em" />
          </div>
          
          <template v-else>
            <transition-group
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <q-item 
                v-for="conv in filteredConversations" 
                :key="conv.id" 
                v-ripple
                clickable
                class="q-py-md conversation-item"
                @click="handleResend(conv.id)"
                :disable="sentIds.has(conv.id)"
              >
                <q-item-section avatar>
                  <AppAvatar
                    :avatar-id="conv.avatarId"
                    :name="conv.title"
                    size="44px"
                    class="shadow-1"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ conv.title }}</q-item-label>
                  <q-item-label caption class="text-uppercase" style="font-size: 10px; letter-spacing: 0.5px;">
                    {{ conv.conversationType }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    v-if="!sentIds.has(conv.id)"
                    color="primary"
                    unelevated
                    round
                    dense
                    icon="send"
                    :loading="resendingIds.has(conv.id)"
                    @click.stop="handleResend(conv.id)"
                  >
                    <q-tooltip>Send</q-tooltip>
                  </q-btn>
                  <q-icon
                    v-else
                    name="check_circle"
                    color="positive"
                    size="32px"
                    class="animated bounceIn"
                  />
                </q-item-section>
              </q-item>
            </transition-group>

            <div v-if="filteredConversations.length === 0 && !isLoading" class="q-pa-xl text-center">
              <q-icon name="forum" size="64px" color="grey-3" />
              <div class="text-grey-7 q-mt-md">No conversations found</div>
            </div>
          </template>
        </q-list>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Done" color="primary" v-close-popup class="text-weight-bold q-px-md" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.resend-dialog {
  width: 450px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.list-container {
  max-height: 50vh;
  min-height: 200px;
}

.conversation-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin: 0 8px;
}

.conversation-item:hover {
  background-color: var(--q-grey-2);
}

.search-input :deep(.q-field__control) {
  border-radius: 12px;
}
</style>
