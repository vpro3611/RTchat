<script setup lang="ts">
import { useRoute } from "vue-router"
import {computed, ref, onMounted, onUnmounted, nextTick, watch} from "vue";
import { useQuasar } from "quasar"
import {ChatStore} from "stores/chat_store";
import {MessageStore} from "stores/message_store";
import {AuthStore} from "stores/auth_store";
import {UserCacheStore} from "stores/user_cache_store";
import {ParticipantStore} from "stores/participant_store";
import {SavedMessagesStore} from "stores/saved_messages_store";
import {MessageApi} from "src/api/apis/message_api";
import {UserApi} from "src/api/apis/user_api";
import {ParticipantApi} from "src/api/apis/participant_api";
import type {User} from "src/api/types/register_response";
import {chatSocket} from "src/services/chat_socket";
import EditGroupTitleDialog from "components/EditGroupTitleDialog.vue";
import LeaveGroupButton from "components/LeaveGroupButton.vue";
import ParticipantListDialog from "components/ParticipantListDialog.vue";
import MessageBubble from "components/MessageBubble.vue";
import AppAvatar from "components/AppAvatar.vue";

const $q = useQuasar()
const route = useRoute();

const message = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const dialogRef = ref();
const participantsDialogRef = ref<{ openDialog: () => void } | null>(null);
const isEditing = ref(false);
const editingMessageId = ref<string | null>(null);
const editContent = ref("");
const isOtherUserBlocked = ref(false);
const isCurrentUserCanSendMessages = ref(true);
const sendRestrictionMessage = ref<string | null>(null);

const chat = computed(() => {
  return ChatStore.findById(route.params.id as string);
});

const conversationId = computed(() => route.params.id as string);

// Получить ID собеседника в direct чате
const otherUserId = computed(() => {
  if (chat.value?.conversationType !== 'direct') return null;
  const currentUserId = AuthStore.user?.id;
  if (!currentUserId) return null;
  
  if (chat.value.userLow === currentUserId) return chat.value.userHigh;
  if (chat.value.userHigh === currentUserId) return chat.value.userLow;
  return null;
});

// Получить имя собеседника
const otherUserName = computed(() => {
  const userId = otherUserId.value;
  if (!userId) return null;
  return UserCacheStore.getUsername(userId);
});

// Проверить статус блокировки собеседника
async function checkOtherUserBlocked() {
  const userId = otherUserId.value;
  if (!userId) {
    isOtherUserBlocked.value = false;
    return;
  }

  try {
    const response = await UserApi.getBlacklist();
    isOtherUserBlocked.value = response.some((u: User) => u.id === userId);
  } catch (e) {
    console.error('Failed to check block status:', e);
  }
}

// Проверить, может ли текущий пользователь писать в этот чат
async function checkCurrentUserCanSendMessages() {
  const currentUserId = AuthStore.user?.id;

  if (!conversationId.value || !currentUserId) {
    isCurrentUserCanSendMessages.value = true;
    return;
  }

  try {
    const response = await ParticipantApi.getSpecificParticipant(conversationId.value, currentUserId);

    if (chat.value?.conversationType === 'direct') {
      isCurrentUserCanSendMessages.value = response.participant.canSendMessages && !isOtherUserBlocked.value;
      return;
    }

    isCurrentUserCanSendMessages.value = response.participant.canSendMessages;
  } catch (e) {
    console.error('Failed to check send permission:', e);
    // fail-safe: не блокируем ввод на transient ошибке
    isCurrentUserCanSendMessages.value = true;
  }
}

// Разблокировать пользователя
function unblockOtherUser() {
  const userId = otherUserId.value;
  if (!userId) return;

  $q.dialog({
    title: 'Unblock User',
    message: `Do you want to unblock ${otherUserName.value || 'this user'}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Unblock',
      color: 'positive',
    },
  }).onOk(() => {
    void (async () => {
      try {
        await UserApi.unblockUser(userId);
        isOtherUserBlocked.value = false;
        isCurrentUserCanSendMessages.value = true;
        sendRestrictionMessage.value = null;
        $q.notify({ type: 'positive', message: 'User has been unblocked' });
      } catch (e) {
        console.error('Failed to unblock user:', e);
        $q.notify({ type: 'negative', message: 'Failed to unblock user' });
      }
    })();
  });
}

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
  if (!message.value.trim() || !conversationId.value || !isCurrentUserCanSendMessages.value) return;

  sendRestrictionMessage.value = null;
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

// Сохранить сообщение
function saveMessageAction(messageId: string) {
  if (!conversationId.value) return;

  void (async () => {
    try {
      await SavedMessagesStore.saveMessage(conversationId.value, messageId);
      $q.notify({
        type: 'positive',
        message: 'Message saved to bookmarks'
      });
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Failed to save message'
      });
    }
  })();
}

function isMessageSaved(messageId: string) {
  return SavedMessagesStore.messages.some(m => m.messageId === messageId);
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
  if (!conversationId.value || !isCurrentUserCanSendMessages.value) return;

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
function handleSocketError(data: { message: string }) {
  const msg = data.message.toLowerCase();

  console.error('Socket error received:', data.message);

  if (msg.includes('block') || msg.includes('cannot send') || msg.includes('not allowed')) {
    isCurrentUserCanSendMessages.value = false;
    sendRestrictionMessage.value = data.message;
    $q.notify({
      type: 'warning',
      message: data.message,
      timeout: 5000
    });
  }
}

// Слушать события block/unblock из диалогов
function handleBlockChange() {
  void checkOtherUserBlocked();
  void checkCurrentUserCanSendMessages();
}

onMounted(() => {
  chatSocket.onError(handleSocketError);
  window.addEventListener('block-status-changed', handleBlockChange);

  // Подгружаем сохраненные сообщения, чтобы обновлять UI (кнопку Save)
  void SavedMessagesStore.fetchMessages(50);

  if (conversationId.value) {
    void loadMessages();
    void checkOtherUserBlocked();
    void checkCurrentUserCanSendMessages();
  }
});

onUnmounted(() => {
  chatSocket.offError(handleSocketError);
  window.removeEventListener('block-status-changed', handleBlockChange);

  if (conversationId.value) {
    chatSocket.getSocket()?.emit('conversation:leave', { conversationId: conversationId.value });
  }
  // Очищаем участники при выходе из чата
  ParticipantStore.clearParticipants();
});

// Перезагрузка при смене чата
watch(() => route.params.id, (newId) => {
  sendRestrictionMessage.value = null;

  if (newId) {
    void loadMessages();
    void checkCurrentUserCanSendMessages();
  }
});

// FIX : FIXED статус блока не обновлялся, когда чат догружался в Store позже
watch(
  () => otherUserId.value,
  async (userId) => {
    if (userId) {
      await checkOtherUserBlocked();
      await checkCurrentUserCanSendMessages();
    } else {
      isOtherUserBlocked.value = false;
      sendRestrictionMessage.value = null;
      await checkCurrentUserCanSendMessages();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="column full-height">

    <!-- HEADER -->
    <div class="q-pa-md border-bottom row items-center justify-between">
      <div class="row items-center q-gutter-x-md">
        <AppAvatar
          :avatar-id="chat?.avatarId"
          :name="chat?.title || 'Chat'"
          size="48px"
        />
        <div>
          <div class="text-h6">
            {{ chat?.title || (chat?.conversationType === 'direct' ? 'Direct Chat' : 'Chat') }}
          </div>
          <div class="text-caption text-grey">
            {{ chat?.conversationType === 'group' ? 'Group' : 'Direct' }}
          </div>
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

    <!-- BLOCKED USER NOTICE (Telegram-style) -->
    <div
      v-if="isOtherUserBlocked" 
      class="bg-grey-3 q-pa-md text-center"
    >
      <q-icon name="block" size="24px" class="q-mr-sm" />
      <span class="text-grey-7">
        You have blocked this user. 
        <q-btn 
          flat 
          dense 
          color="primary" 
          label="Unblock" 
          class="q-ml-sm" 
          @click="unblockOtherUser"
        />
      </span>
    </div>

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
          :isSaved="isMessageSaved(message.id)"
          @edit="startEdit"
          @delete="deleteMessage"
          @save="saveMessageAction"
        />

        <!-- Typing indicator placeholder -->
        <div id="typing-indicator"></div>
      </div>
    </div>

    <!-- EDIT MESSAGE INPUT -->
    <div v-if="isEditing" class="q-pa-md border-top row items-center q-gutter-sm">
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
        :disable="!isCurrentUserCanSendMessages"
        :placeholder="isCurrentUserCanSendMessages ? 'Type a message...' : 'You cannot send messages in this chat'"
      >
        <template v-slot:append>
          <q-btn
            flat
            round
            dense
            icon="send"
            color="primary"
            @click="sendMessage"
            :disable="!message.trim() || !isCurrentUserCanSendMessages"
          />
        </template>
      </q-input>
      <div
        v-if="!isCurrentUserCanSendMessages"
        class="text-caption text-negative q-mt-xs"
      >
        {{ sendRestrictionMessage || "You can't send messages in this chat." }}
      </div>
    </div>

  </div>
</template>
