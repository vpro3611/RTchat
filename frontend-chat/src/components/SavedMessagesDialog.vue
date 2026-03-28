<script setup lang="ts">
import { ref } from "vue"
import { useQuasar } from "quasar"
import { useRouter } from "vue-router"
import { SavedMessagesStore } from "stores/saved_messages_store"
import { UserCacheStore } from "stores/user_cache_store"
import { ChatStore } from "stores/chat_store"
import AppAvatar from "components/AppAvatar.vue"

const $q = useQuasar()
const router = useRouter()
const isOpen = ref(false)

async function loadMessages() {
  await SavedMessagesStore.fetchMessages(20)
  
  // Кэшируем имена отправителей
  const senderIds = SavedMessagesStore.messages.map(m => m.senderId)
  void UserCacheStore.ensureUsers(senderIds)
}

async function loadMore(index: number, done: (stop?: boolean) => void) {
  if (!SavedMessagesStore.hasMore || SavedMessagesStore.isLoading) {
    done(true)
    return
  }

  try {
    await SavedMessagesStore.loadMore(20)
    
    const senderIds = SavedMessagesStore.messages.map(m => m.senderId)
    void UserCacheStore.ensureUsers(senderIds)
    
    done(!SavedMessagesStore.hasMore)
  } catch {
    done(true)
  }
}

function open() {
  isOpen.value = true
  void loadMessages()
}

defineExpose({ open })

function removeMessage(messageId: string) {
  $q.dialog({
    title: 'Remove Bookmark',
    message: 'Remove this message from your saved messages?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await SavedMessagesStore.removeMessage(messageId)
        $q.notify({ type: 'positive', message: 'Message removed' })
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to remove message' })
      }
    })()
  })
}

function jumpToMessage(conversationId: string) {
  isOpen.value = false
  void router.push(`/chat/${conversationId}`)
}

function getChatTitle(convId: string) {
  const chat = ChatStore.chats.find(c => c.id === convId)
  return chat?.title || `Chat ${convId.slice(0, 6)}...`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 500px; max-width: 90vw;" class="vibrant-dialog">
      <q-card-section class="row items-center bg-primary text-white">
        <q-icon name="bookmarks" size="24px" class="q-mr-sm" />
        <div class="text-h6" style="font-family: 'EB Garamond', serif;">Saved Messages</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-none bg-grey-2" style="height: 60vh;">
        <q-scroll-area class="fit q-pa-md">
          <q-infinite-scroll @load="loadMore" :offset="100" v-if="SavedMessagesStore.messages.length > 0 || SavedMessagesStore.isLoading">
            
            <div class="q-gutter-y-md">
              <q-card 
                v-for="msg in SavedMessagesStore.messages" 
                :key="msg.messageId"
                class="block-card shadow-3"
              >
                <q-card-section class="q-pb-xs">
                  <div class="row justify-between items-center">
                    <div class="text-caption text-bold text-primary text-uppercase">
                      {{ getChatTitle(msg.conversationId) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      Saved: {{ formatDate(msg.createdAt) }}
                    </div>
                  </div>
                  
                  <div class="row items-center q-mt-sm">
                    <AppAvatar
                      :avatar-id="UserCacheStore.getAvatarId(msg.senderId)"
                      :name="UserCacheStore.getUsername(msg.senderId) || '?'"
                      size="32px"
                      class="q-mr-sm"
                    />
                    <span class="text-weight-bold" style="font-family: 'Crimson Text', serif; font-size: 1.1em;">
                      {{ UserCacheStore.getUsername(msg.senderId) || 'Loading...' }}
                    </span>
                  </div>
                </q-card-section>

                <q-card-section class="q-pt-sm message-content" style="font-family: 'Crimson Text', serif; font-size: 1.2em;">
                  {{ msg.content }}
                </q-card-section>

                <q-card-actions align="right" class="q-pt-none">
                  <q-btn flat color="negative" icon="delete" label="Remove" size="sm" @click="removeMessage(msg.messageId)" />
                  <q-btn flat color="primary" icon="login" label="Go to Chat" size="sm" @click="jumpToMessage(msg.conversationId)" />
                </q-card-actions>
              </q-card>
            </div>

            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </template>
          </q-infinite-scroll>
          
          <div v-else class="flex flex-center full-height text-grey-7 column">
            <q-icon name="bookmark_border" size="64px" class="q-mb-md opacity-50" />
            <div class="text-h6" style="font-family: 'EB Garamond', serif;">No saved messages yet</div>
            <div class="text-body2">Save important messages from your chats to find them here.</div>
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=EB+Garamond:wght@400;500;600;700;800&display=swap');

.vibrant-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.block-card {
  border-radius: 12px;
  border-left: 4px solid var(--q-primary);
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.block-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  color: #1E293B;
}
</style>
