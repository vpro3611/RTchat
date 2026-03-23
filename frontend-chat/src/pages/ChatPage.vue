<script setup lang="ts">
import { useRoute } from "vue-router"
import {computed, ref, onMounted, onUnmounted, nextTick, watch} from "vue";
import {ChatStore} from "stores/chat_store";
import {MessageStore} from "stores/message_store";
import {AuthStore} from "stores/auth_store";
import {UserCacheStore} from "stores/user_cache_store";
import {ParticipantStore} from "stores/participant_store";
import {MessageApi} from "src/api/apis/message_api";
import {chatSocket} from "src/services/chat_socket";
import EditGroupTitleDialog from "components/EditGroupTitleDialog.vue";
import LeaveGroupButton from "components/LeaveGroupButton.vue";
import ParticipantListDialog from "components/ParticipantListDialog.vue";
import MessageBubble from "components/MessageBubble.vue";

const route = useRoute();

const message = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const dialogRef = ref();
const participantsDialogRef = ref<{ openDialog: () => void } | null>(null);
const isEditing = ref(false);
const editingMessageId = ref<string | null>(null);
const editContent = ref("");

const chat = computed(() => {
  return ChatStore.findById(route.params.id as string);
});

const conversationId = computed(() => route.params.id as string);

// Загрузка сообщений
async function loadMessages() {
  if (!conversationId.value) return;

  MessageStore.setLoading(true);

  try {
    const response = await MessageApi.getMessages(conversationId.value);
    MessageStore.setMessages(response.items, response.nextCursor);
    MessageStore.finishBootstrapping();

    // Загружаем данные об отправителях в кэш
    const senderIds = response.items.map(m => m.senderId).filter(Boolean);
    await UserCacheStore.ensureUsers(senderIds);

    // Подключаемся к WebSocket и ждём готовности
    chatSocket.connect();
    await chatSocket.waitForConnection();

    // Подписываемся на комнату
    chatSocket.getSocket()?.emit('conversation:join', { conversationId: conversationId.value });

    // Прокрутка к последнему сообщению
    await nextTick();
    scrollToBottom();

    // Отмечаем сообщения как прочитанные
    if (MessageStore.messages.length > 0) {
      const lastMessage = MessageStore.messages[MessageStore.messages.length - 1];
      if (lastMessage) {
        chatSocket.markAsRead(conversationId.value, lastMessage.id);
      }
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  } finally {
    MessageStore.setLoading(false);
  }
}

// Загрузка дополнительных сообщений (пагинация)
async function loadMoreMessages() {
  if (!conversationId.value || !MessageStore.hasMore || MessageStore.isLoading) return;

  MessageStore.setLoading(true);
  try {
    const response = await MessageApi.getMessages(
      conversationId.value,
      MessageStore.nextCursor ?? undefined
    );
    MessageStore.appendMessages(response.items, response.nextCursor);

    // Загружаем данные об отправителях в кэш
    const senderIds = response.items.map(m => m.senderId).filter(Boolean);
    await UserCacheStore.ensureUsers(senderIds);
  } catch (error) {
    console.error('Failed to load more messages:', error);
  } finally {
    MessageStore.setLoading(false);
  }
}

// Отправка сообщения через WebSocket
function sendMessage() {
  if (!message.value.trim() || !conversationId.value) return;

  chatSocket.sendMessage(conversationId.value, message.value.trim());
  message.value = "";
}

// Начало редактирования
function startEdit(messageId: string, content: string) {
  isEditing.value = true;
  editingMessageId.value = messageId;
  editContent.value = content;
}

// Отмена редактирования
function cancelEdit() {
  isEditing.value = false;
  editingMessageId.value = null;
  editContent.value = "";
}

// Сохранить редактирование через WebSocket
function saveEdit() {
  if (!editContent.value.trim() || !editingMessageId.value || !conversationId.value) return;

  chatSocket.editMessage(conversationId.value, editingMessageId.value, editContent.value.trim());
  cancelEdit();
}

// Удаление сообщения через WebSocket
function deleteMessage(messageId: string) {
  if (!conversationId.value) return;

  chatSocket.deleteMessage(conversationId.value, messageId);
}

// Прокрутка к низу
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

// Обработка typing индикатора
let typingTimeout: NodeJS.Timeout | null = null;

function handleTyping() {
  if (!conversationId.value) return;

  chatSocket.startTyping(conversationId.value);

  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    chatSocket.stopTyping(conversationId.value);
  }, 2000);
}

// Открыть список участников
function openParticipantsDialog() {
  if (!conversationId.value) return;
  participantsDialogRef.value?.openDialog();
}

// Очистка при выходе
onMounted(() => {
  if (conversationId.value) {
    void loadMessages();
  }
});

onUnmounted(() => {
  if (conversationId.value) {
    chatSocket.getSocket()?.emit('conversation:leave', { conversationId: conversationId.value });
  }
  // Очищаем участники при выходе из чата
  ParticipantStore.clearParticipants();
});

// Перезагрузка при смене чата
watch(() => route.params.id, (newId) => {
  if (newId) {
    void loadMessages();
  }
});
</script>

<template>
  <div class="column full-height">

    <!-- HEADER -->
    <div class="q-pa-md border-bottom row items-center justify-between">
      <div>
        <div class="text-h6">
          {{ chat?.title || (chat?.conversationType === 'direct' ? 'Direct Chat' : 'Chat') }}
        </div>
        <div class="text-caption text-grey">
          {{ chat?.conversationType === 'group' ? 'Group' : 'Direct' }}
        </div>
      </div>

      <div class="row q-gutter-sm">
        <!-- Кнопка списка участников для групп -->
        <q-btn
          v-if="chat?.conversationType === 'group'"
          icon="group"
          flat
          round
          @click="openParticipantsDialog"
        >
          <q-tooltip>Participants</q-tooltip>
        </q-btn>

        <q-btn
          v-if="chat?.conversationType === 'group'"
          icon="edit"
          flat
          round
          @click="dialogRef.openDialog(chat.id, chat.title)"
        >
          <q-tooltip>Edit title</q-tooltip>
        </q-btn>

        <LeaveGroupButton
          v-if="chat?.conversationType === 'group'"
          :chatId="chat.id"
        />
      </div>
    </div>

    <EditGroupTitleDialog ref="dialogRef" />
    <ParticipantListDialog
      ref="participantsDialogRef"
      :conversationId="conversationId"
      :conversationType="(chat?.conversationType as 'direct' | 'group') ?? 'direct'"
    />

    <!-- MESSAGES LIST -->
    <div
      ref="messagesContainer"
      class="col q-pa-md scroll"
      style="overflow-y: auto;"
    >
      <div v-if="MessageStore.isBootstrapping" class="flex flex-center full-height">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div v-else-if="MessageStore.messages.length === 0" class="text-grey text-center q-pa-xl">
        No messages yet. Start the conversation!
      </div>

      <div v-else>
        <!-- Load more button -->
        <div v-if="MessageStore.hasMore" class="text-center q-pa-sm">
          <q-btn
            flat
            :loading="MessageStore.isLoading"
            @click="loadMoreMessages"
          >
            Load more
          </q-btn>
        </div>

        <!-- Messages -->
        <MessageBubble
          v-for="message in MessageStore.messages"
          :key="message.id"
          :message="message"
          :isOwn="message.senderId === AuthStore.user?.id"
          @edit="startEdit"
          @delete="deleteMessage"
        />

        <!-- Typing indicator placeholder -->
        <div id="typing-indicator"></div>
      </div>
    </div>

    <!-- EDIT MESSAGE INPUT -->
    <div v-if="isEditing" class="q-pa-md bg-grey-2 row items-center q-gutter-sm">
      <q-input
        v-model="editContent"
        dense
        outlined
        class="col"
        placeholder="Edit message..."
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
      />
      <q-btn flat color="primary" label="Save" @click="saveEdit" />
      <q-btn flat color="grey" label="Cancel" @click="cancelEdit" />
    </div>

    <!-- INPUT -->
    <div v-else class="q-pa-md">
      <q-input
        v-model="message"
        @keyup.enter="sendMessage"
        @input="handleTyping"
        dense
        outlined
        placeholder="Type a message..."
      >
        <template v-slot:append>
          <q-btn
            flat
            round
            dense
            icon="send"
            color="primary"
            @click="sendMessage"
            :disable="!message.trim()"
          />
        </template>
      </q-input>
    </div>

  </div>
</template>
