<script setup lang="ts">
import { computed } from "vue";
import type {Message} from "src/api/types/message_response";
import { UserCacheStore } from "stores/user_cache_store";

const props = defineProps<{
  message: Message;
  isOwn: boolean;
}>();

// FIX : FIXED - вычисляем senderUsername из кэша
const senderUsername = computed(() => {
  // Если есть в сообщении - используем
  if (props.message.senderUsername) {
    return props.message.senderUsername;
  }
  // Иначе получаем из кэша
  return UserCacheStore.getUsername(props.message.senderId);
});

const emit = defineEmits<{
  (e: 'edit', messageId: string, content: string): void;
  (e: 'delete', messageId: string): void;
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

function handleEdit() {
  emit('edit', props.message.id, props.message.content);
}

function handleDelete() {
  emit('delete', props.message.id);
}
</script>

<template>
  <div
    class="q-my-sm"
    :class="isOwn ? 'row justify-end' : 'row justify-start'"
  >
    <q-card
      class="message-bubble"
      :class="isOwn ? 'bg-primary text-white' : 'bg-grey-2'"
      :style="{ maxWidth: '70%' }"
    >
      <!-- Username (только для чужих сообщений) -->
      <div
        v-if="!isOwn && senderUsername"
        class="text-caption q-px-sm q-pt-xs"
        :class="isOwn ? 'text-white' : 'text-primary'"
      >
        {{ senderUsername }}
      </div>

      <!-- Content -->
      <q-card-section class="q-py-xs q-px-sm">
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
          class="text-caption"
          :class="isOwn ? 'text-white' : 'text-grey'"
        >
          {{ formatDate(message.createdAt) }} {{ formatTime(message.createdAt) }}
        </div>

        <!-- Menu button (только для своих сообщений) -->
        <q-btn
          v-if="isOwn"
          flat
          dense
          round
          size="sm"
          icon="more_vert"
        >
          <q-menu anchor="top right" self="top left">
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup @click="handleEdit">
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleDelete">
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

.message-content {
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
