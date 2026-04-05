<script setup lang="ts">
import { computed, onMounted } from "vue";
import type {Message} from "src/api/types/message_response";
import { UserCacheStore } from "stores/user_cache_store";
import AppAvatar from "./AppAvatar.vue";
import AttachmentGallery from "./AttachmentGallery.vue";
import FileAttachment from "./FileAttachment.vue";

import type {Attachment} from "src/api/types/attachment";

const props = defineProps<{
  message: Message;
  isOwn: boolean;
  isSaved?: boolean;
}>();

const mediaAttachments = computed(() => 
  props.message.attachments?.filter(a => a.type === 'image' || a.type === 'video') || []
);

const fileAttachments = computed(() => 
  props.message.attachments?.filter(a => a.type === 'file') || []
);

// FIX : FIXED - вычисляем senderUsername из кэша
const senderUsername = computed(() => {
  if (props.message.senderUsername) return props.message.senderUsername;
  return UserCacheStore.getUsername(props.message.senderId);
});

const senderAvatarId = computed(() => {
  if (props.message.senderAvatarId !== undefined) return props.message.senderAvatarId;
  return UserCacheStore.getAvatarId(props.message.senderId);
});

const originalSenderUsername = computed(() => {
  if (!props.message.isResent || !props.message.originalSenderId) return null;
  return UserCacheStore.getUsername(props.message.originalSenderId) || 'User';
});

onMounted(() => {
  if (props.message.isResent && props.message.originalSenderId) {
    void UserCacheStore.ensureUser(props.message.originalSenderId);
  }
});

const emit = defineEmits<{
  (e: 'edit', messageId: string, content: string): void;
  (e: 'reply', message: Message): void;
  (e: 'delete', messageId: string): void;
  (e: 'save', messageId: string): void;
  (e: 'forward', messageId: string): void;
  (e: 'open-media', index: number, attachments: Attachment[]): void;
  (e: 'scroll-to-parent', messageId: string): void;
}>();

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString();
}

function handleReply() {
  emit('reply', props.message);
}

function handleSwipe({ direction }: { direction: string }) {
  if (direction === 'right') {
    handleReply();
  }
}

function handleEdit() {
  emit('edit', props.message.id, props.message.content);
}

function handleDelete() {
  emit('delete', props.message.id);
}

function handleSave() {
  emit('save', props.message.id);
}

function handleForward() {
  emit('forward', props.message.id);
}
</script>

<template>
  <div
    class="q-my-sm"
    :class="isOwn ? 'row justify-end' : 'row justify-start'"
  >
    <q-card
      v-touch-swipe.right="handleSwipe"
      class="message-bubble shadow-2"
      :class="isOwn ? 'bg-primary text-white' : 'message-bubble-incoming'"
      :style="{ maxWidth: '75%', minWidth: '80px' }"
    >
      <!-- Forwarded from -->
      <div
        v-if="message.isResent"
        class="text-caption q-px-sm q-pt-xs italic flex items-center"
        :class="isOwn ? 'text-white-70' : 'text-grey'"
        style="opacity: 0.8; font-size: 11px;"
      >
        <q-icon name="forward" size="14px" class="q-mr-xs" />
        Forwarded from {{ originalSenderUsername }}
      </div>

      <!-- Sender -->
      <div
        v-if="!isOwn && senderUsername"
        class="text-caption q-px-sm q-pt-xs row items-center q-gutter-x-xs text-primary text-weight-bold"
      >
        <AppAvatar
          :avatar-id="senderAvatarId"
          :name="senderUsername"
          size="20px"
        />
        <span>{{ senderUsername }}</span>
      </div>

      <!-- Reply Context -->
      <div 
        v-if="message.replyMetadata" 
        class="reply-context q-mx-xs q-mt-xs rounded-borders cursor-pointer"
        @click="emit('scroll-to-parent', message.replyMetadata.parentMessageId)"
      >
        <div class="row items-center no-wrap q-gutter-x-xs">
          <div class="reply-accent-line bg-primary" />
          <div class="col overflow-hidden">
            <div class="text-weight-bold text-primary" style="font-size: 11px;">
              {{ UserCacheStore.getUsername(message.replyMetadata.parentSenderId) || 'User' }}
            </div>
            <div class="text-caption ellipsis" :class="isOwn ? 'text-white' : 'text-grey-7'" style="font-size: 11px; opacity: 0.9;">
              {{ message.replyMetadata.parentContentSnippet }}
            </div>
          </div>
        </div>
      </div>

      <!-- Media Attachments -->
      <AttachmentGallery
        v-if="mediaAttachments.length > 0"
        :attachments="mediaAttachments"
        @open-viewer="(index) => emit('open-media', index, mediaAttachments)"
      />

      <!-- File Attachments -->
      <div v-if="fileAttachments.length > 0" class="q-px-sm q-pt-xs">
        <FileAttachment
          v-for="file in fileAttachments"
          :key="file.id"
          :attachment="file"
          :is-own="isOwn"
        />
      </div>

      <!-- Content -->
      <q-card-section v-if="message.content" class="q-py-xs q-px-sm">
        <div class="message-content">
          {{ message.content }}
        </div>
        <div
          v-if="message.isEdited"
          class="text-caption"
          :class="isOwn ? 'text-white' : 'text-grey'"
          style="font-size: 10px;"
        >
          edited
        </div>
      </q-card-section>

      <!-- Time & Menu -->
      <div class="row items-center justify-between q-px-sm q-pb-xs">
        <div
          class="text-caption row items-center"
          :class="isOwn ? 'text-white' : 'text-grey'"
        >
          {{ formatDate(message.createdAt) }} {{ formatTime(message.createdAt) }}
          <q-icon v-if="isSaved" name="bookmark" size="14px" class="q-ml-xs" />

          <!-- Read status ticks for own messages -->
          <template v-if="isOwn">
            <q-icon
              v-if="message.isRead"
              name="done_all"
              size="16px"
              class="q-ml-xs text-blue-2"
              style="color: #bbdefb !important;"
            >
              <q-tooltip>Read</q-tooltip>
            </q-icon>
            <q-icon
              v-else
              name="done"
              size="16px"
              class="q-ml-xs text-white-70"
            >
              <q-tooltip>Sent</q-tooltip>
            </q-icon>
          </template>
        </div>

        <!-- Menu button (доступно для всех сообщений) -->
        <q-btn
          flat
          dense
          round
          size="sm"
          icon="more_vert"
        >
          <q-menu anchor="top right" self="top left">
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup @click="handleReply">
                <q-item-section>Reply</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="!isSaved && handleSave()" :disable="isSaved">
                <q-item-section :class="isSaved ? 'text-grey' : 'text-primary'">
                  {{ isSaved ? 'Saved' : 'Save' }}
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleForward">
                <q-item-section>Forward</q-item-section>
              </q-item>
              <q-item v-if="isOwn" clickable v-close-popup @click="handleEdit">
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item v-if="isOwn" clickable v-close-popup @click="handleDelete">
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
.message-bubble {
  border-radius: 12px;
}

.message-bubble-incoming {
  background: var(--q-bg-message-incoming, #f0f0f0);
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

.message-content {
  word-break: break-word;
  white-space: pre-wrap;
}

.reply-context {
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px 4px 0;
  border-radius: 4px;
  overflow: hidden;
}

.body--dark .reply-context {
  background: rgba(255, 255, 255, 0.1);
}

.reply-accent-line {
  width: 3px;
  height: 100%;
  min-height: 24px;
  border-radius: 2px;
}
</style>
