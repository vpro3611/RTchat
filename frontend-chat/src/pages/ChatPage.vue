<script setup lang="ts">
import { useRoute } from "vue-router"
import {computed, ref, onMounted, onUnmounted, nextTick, watch} from "vue";
import { QInput, useQuasar } from "quasar"
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
import type {Message} from "src/api/types/message_response";
import {chatSocket} from "src/services/chat_socket";
import EditGroupTitleDialog from "components/EditGroupTitleDialog.vue";
import LeaveGroupButton from "components/LeaveGroupButton.vue";
import ParticipantListDialog from "components/ParticipantListDialog.vue";
import MessageBubble from "components/MessageBubble.vue";
import ResendMessageDialog from "components/ResendMessageDialog.vue";
import AppAvatar from "components/AppAvatar.vue";
import MediaViewer from "components/MediaViewer.vue";
import DragAndDropOverlay from "components/DragAndDropOverlay.vue";
import UploadPreviewBar from "components/UploadPreviewBar.vue";
import type { Attachment } from "src/api/types/attachment";

const $q = useQuasar()
const route = useRoute();

const message = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const messageInputRef = ref<QInput | null>(null);
const dialogRef = ref();
const resendDialogRef = ref<{ open: () => void } | null>(null);
const forwardingMessageId = ref<string>("");
const participantsDialogRef = ref<{ openDialog: () => void } | null>(null);
const mediaViewerRef = ref<{ open: (attachments: Attachment[], index: number) => void } | null>(null);
const isEditing = ref(false);
const editingMessageId = ref<string | null>(null);
const editContent = ref("");
const isOtherUserBlocked = ref(false);
const isCurrentUserCanSendMessages = ref(true);
const sendRestrictionMessage = ref<string | null>(null);
const isUserScrollingUp = ref(false);
const replyingToMessage = ref<Message | null>(null);

const pendingFiles = ref<File[]>([]);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

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

// Получить аватар собеседника
const otherUserAvatarId = computed(() => {
  const userId = otherUserId.value;
  if (!userId) return null;
  return UserCacheStore.getAvatarId(userId);
});

// Focus input
function focusInput() {
  void nextTick(() => {
    messageInputRef.value?.focus();
  });
}

// Scroll detection
function handleScroll() {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  // If user is more than 150px away from bottom, consider them "scrolling up"
  isUserScrollingUp.value = (scrollHeight - scrollTop - clientHeight) > 150;
}

// Прокрутка к низу
function scrollToBottom(force = false) {
  void nextTick(() => {
    if (messagesContainer.value && (!isUserScrollingUp.value || force)) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

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
    ok: { label: 'Unblock', color: 'positive' },
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

    const senderIds = response.items.map(m => m.senderId);
    const originalSenderIds = response.items.map(m => m.originalSenderId).filter(Boolean);
    const allIds = Array.from(new Set([...senderIds, ...originalSenderIds])) as string[];

    await UserCacheStore.ensureUsers(allIds);

    chatSocket.connect();
    await chatSocket.waitForConnection();
    chatSocket.getSocket()?.emit('conversation:join', { conversationId: conversationId.value });

    scrollToBottom(true);
    focusInput();

    if (MessageStore.messages.length > 0) {
      const lastMessage = MessageStore.messages[MessageStore.messages.length - 1];
      if (lastMessage && lastMessage.senderId !== AuthStore.user?.id) {
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
    const response = await MessageApi.getMessages(conversationId.value, MessageStore.nextCursor ?? undefined);
    MessageStore.appendMessages(response.items, response.nextCursor);

    const senderIds = response.items.map(m => m.senderId);
    const originalSenderIds = response.items.map(m => m.originalSenderId).filter(Boolean);
    const allIds = Array.from(new Set([...senderIds, ...originalSenderIds])) as string[];

    await UserCacheStore.ensureUsers(allIds);
  } catch (error) {
    console.error('Failed to load more messages:', error);
  } finally {
    MessageStore.setLoading(false);
  }
}

// Отправка сообщения
async function sendMessage() {
  const content = message.value.trim();
  const hasFiles = pendingFiles.value.length > 0;

  if ((!content && !hasFiles) || !conversationId.value || !isCurrentUserCanSendMessages.value) return;

  sendRestrictionMessage.value = null;
  const parentId = replyingToMessage.value?.id;

  try {
    if (hasFiles) {
      await MessageApi.sendMessageWithFiles(conversationId.value, content, pendingFiles.value, parentId);
      pendingFiles.value = [];
    } else {
      chatSocket.sendMessage(conversationId.value, content, parentId);
    }

    message.value = "";
    cancelReply(); // Reset reply state after sending
    scrollToBottom(true);
    focusInput();
  } catch (error: unknown) {
    console.error('Failed to send message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    $q.notify({
      type: 'negative',
      message: errorMessage
    });
  }
}

// Drag and drop handlers
function onDragEnter(e: DragEvent) {
  e.preventDefault();
  if (isCurrentUserCanSendMessages.value) {
    isDragging.value = true;
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (isCurrentUserCanSendMessages.value) {
    isDragging.value = true;
  }
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  // Only hide if we're leaving the container
  if (e.currentTarget === e.target) {
    isDragging.value = false;
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;

  if (!isCurrentUserCanSendMessages.value) return;

  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    addFiles(Array.from(target.files));
    target.value = ''; // Reset input
  }
}

function addFiles(files: File[]) {
  // 10MB limit check
  const MAX_SIZE = 10 * 1024 * 1024;
  const oversizedFiles = files.filter(f => f.size > MAX_SIZE);

  if (oversizedFiles.length > 0) {
    $q.notify({
      type: 'negative',
      message: `Some files exceed 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`,
      timeout: 5000
    });
  }

  const validFiles = files.filter(f => f.size <= MAX_SIZE);
  pendingFiles.value.push(...validFiles);
}

function removeFile(index: number) {
  pendingFiles.value.splice(index, 1);
}

function startReply(msg: Message) {
  replyingToMessage.value = msg;
  isEditing.value = false; // Cancel edit if replying
  focusInput();
}

function cancelReply() {
  replyingToMessage.value = null;
}

function scrollToMessage(messageId: string) {
  const el = document.getElementById(`msg-${messageId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight-message');
    setTimeout(() => el.classList.remove('highlight-message'), 2000);
  } else {
    // Optional: if message not in DOM, you might want to load more?
    // For now, let's just log if it's not found
    console.warn(`Message ${messageId} not found in DOM`);
  }
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
  focusInput();
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

// Переслать сообщение
async function handleForwardMessage(messageId: string) {
  forwardingMessageId.value = messageId;
  await nextTick();
  resendDialogRef.value?.open();
}

// Сохранить сообщение
function saveMessageAction(messageId: string) {
  if (!conversationId.value) return;
  void (async () => {
    try {
      await SavedMessagesStore.saveMessage(conversationId.value, messageId);
      $q.notify({ type: 'positive', message: 'Message saved to bookmarks' });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to save message' });
    }
  })();
}

function isMessageSaved(messageId: string) {
  return SavedMessagesStore.messages.some(m => m.messageId === messageId);
}

// Обработка typing индикатора
let typingTimeout: NodeJS.Timeout | null = null;
function handleTyping() {
  if (!conversationId.value || !isCurrentUserCanSendMessages.value) return;
  chatSocket.startTyping(conversationId.value);
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    chatSocket.stopTyping(conversationId.value);
  }, 2000);
}

// Открыть список участников
function openParticipantsDialog() {
  if (!conversationId.value) return;
  participantsDialogRef.value?.openDialog();
}

function handleOpenMedia(index: number, attachments: Attachment[]) {
  mediaViewerRef.value?.open(attachments, index);
}

function handleSocketError(data: { message: string }) {
  const msg = data.message.toLowerCase();
  console.error('Socket error received:', data.message);
  if (msg.includes('block') || msg.includes('cannot send') || msg.includes('not allowed')) {
    isCurrentUserCanSendMessages.value = false;
    sendRestrictionMessage.value = data.message;
    $q.notify({ type: 'warning', message: data.message, timeout: 5000 });
  }
}

function handleBlockChange() {
  void checkOtherUserBlocked();
  void checkCurrentUserCanSendMessages();
}

onMounted(() => {
  chatSocket.onError(handleSocketError);
  window.addEventListener('block-status-changed', handleBlockChange);
  void SavedMessagesStore.fetchMessages(50);
});

onUnmounted(() => {
  chatSocket.offError(handleSocketError);
  window.removeEventListener('block-status-changed', handleBlockChange);
  if (conversationId.value) {
    chatSocket.setCurrentChat(null);
    chatSocket.getSocket()?.emit('conversation:leave', { conversationId: conversationId.value });
  }
  ParticipantStore.clearParticipants();
});

// Computed for message input to handle both normal and edit modes cleanly
const inputModel = computed({
  get: () => isEditing.value ? editContent.value : message.value,
  set: (val) => {
    if (isEditing.value) {
      editContent.value = val;
    } else {
      message.value = val;
    }
  }
});

// Watch for chat changes
watch(conversationId, (newId) => {
  if (newId) {
    chatSocket.setCurrentChat(newId);
    void loadMessages();
    void checkOtherUserBlocked();
    void checkCurrentUserCanSendMessages();
    focusInput();
  } else {
    chatSocket.setCurrentChat(null);
  }
}, { immediate: true });

// FIX : FIXED статус блока не обновлялся, когда чат догружался в Store позже
watch(
  () => otherUserId.value,
  async (userId) => {
    if (userId) {
      await UserCacheStore.ensureUser(userId);
      await checkOtherUserBlocked();
      await checkCurrentUserCanSendMessages();
    } else {
      isOtherUserBlocked.value = false;
      sendRestrictionMessage.value = null;
      await checkCurrentUserCanSendMessages();
    }
  }
);

// MARK AS READ LOGIC & AUTO SCROLL
watch(
  () => MessageStore.messages.length,
  (newCount) => {
    if (newCount > 0 && conversationId.value) {
      const lastMessage = MessageStore.messages[MessageStore.messages.length - 1];
      if (lastMessage && lastMessage.senderId !== AuthStore.user?.id) {
        chatSocket.markAsRead(conversationId.value, lastMessage.id);
      }
      scrollToBottom();
    }
  }
);
</script>

<template>
  <div
    class="chat-page-container column no-wrap"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <DragAndDropOverlay :show="isDragging" />

    <!-- HEADER -->
    <header class="chat-header q-pa-md border-bottom row items-center justify-between">
      <div class="row items-center q-gutter-x-md">
        <AppAvatar
          :avatar-id="chat?.conversationType === 'direct' ? otherUserAvatarId : chat?.avatarId"
          :name="chat?.conversationType === 'direct' ? (otherUserName || 'Direct Chat') : (chat?.title || 'Chat')"
          size="48px"
        />
        <div>
          <div class="text-h6 line-height-1">
            {{ chat?.conversationType === 'direct' ? (otherUserName || 'Direct Chat') : (chat?.title || 'Chat') }}
          </div>
          <div class="text-caption text-grey">
            {{ chat?.conversationType === 'group' ? 'Group' : 'Direct' }}
          </div>
        </div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn v-if="chat?.conversationType === 'group'" icon="group" flat round @click="openParticipantsDialog">
          <q-tooltip>Participants</q-tooltip>
        </q-btn>
        <q-btn v-if="chat?.conversationType === 'group'" icon="edit" flat round @click="dialogRef.openDialog(chat.id, chat.title)">
          <q-tooltip>Edit title</q-tooltip>
        </q-btn>
        <LeaveGroupButton v-if="chat?.conversationType === 'group'" :chatId="chat.id" />
      </div>
    </header>

    <EditGroupTitleDialog ref="dialogRef" />
    <ResendMessageDialog
      ref="resendDialogRef"
      :messageId="forwardingMessageId"
      :sourceConversationId="conversationId"
    />
    <ParticipantListDialog
      ref="participantsDialogRef"
      :conversationId="conversationId"
      :conversationType="(chat?.conversationType as 'direct' | 'group') ?? 'direct'"
    />
    <MediaViewer ref="mediaViewerRef" />

    <!-- BLOCKED NOTICE -->
    <div v-if="isOtherUserBlocked" class="blocked-notice q-pa-sm text-center">
      <q-icon name="block" size="20px" class="q-mr-sm" color="negative" />
      <span class="text-grey">You have blocked this user.</span>
      <q-btn flat dense color="primary" label="Unblock" @click="unblockOtherUser" class="q-ml-sm" />
    </div>

    <!-- MESSAGES LIST -->
    <main
      ref="messagesContainer"
      class="messages-scroll-area col scroll relative-position q-pa-md"
      @scroll="handleScroll"
    >
      <div v-if="MessageStore.isBootstrapping" class="flex flex-center full-height">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div v-else-if="MessageStore.messages.length === 0" class="text-grey text-center q-pa-xl">
        No messages yet. Start the conversation!
      </div>

      <div v-else>
        <div v-if="MessageStore.hasMore" class="text-center q-pa-sm">
          <q-btn flat size="sm" color="primary" :loading="MessageStore.isLoading" @click="loadMoreMessages">
            Load more
          </q-btn>
        </div>

        <MessageBubble
          v-for="message in MessageStore.messages"
          :id="'msg-' + message.id"
          :key="message.id"
          :message="message"
          :isOwn="message.senderId === AuthStore.user?.id"
          :isSaved="isMessageSaved(message.id)"
          @edit="startEdit"
          @reply="startReply"
          @delete="deleteMessage"
          @save="saveMessageAction"
          @forward="handleForwardMessage"
          @open-media="handleOpenMedia"
          @scroll-to-parent="scrollToMessage"
        />
        <div id="typing-indicator" style="height: 20px;"></div>
      </div>

      <!-- SCROLL TO BOTTOM FAB -->
      <transition
        appear
        enter-active-class="animated zoomIn"
        leave-active-class="animated zoomOut"
      >
        <q-btn
          v-if="isUserScrollingUp"
          fab-mini
          icon="keyboard_arrow_down"
          color="primary"
          class="scroll-bottom-btn absolute-bottom-right"
          @click="scrollToBottom(true)"
        />
      </transition>
    </main>

    <!-- INPUT AREA (STICKY) -->
    <footer class="input-area border-top q-pa-md">
      <!-- Upload Previews -->
      <UploadPreviewBar
        v-if="pendingFiles.length > 0"
        :pending-files="pendingFiles"
        @remove="removeFile"
        class="q-mb-sm rounded-borders"
      />

      <!-- Edit Mode -->
      <div v-if="isEditing" class="row items-center q-gutter-sm q-mb-sm edit-mode-indicator q-pa-sm rounded-borders">
        <q-icon name="edit" color="primary" />
        <div class="col ellipsis text-caption">Editing message...</div>
        <q-btn flat round dense icon="close" size="sm" @click="cancelEdit" />
      </div>

      <!-- Reply Preview -->
      <div v-if="replyingToMessage" class="reply-preview-bar row items-center q-pa-sm q-mb-sm rounded-borders">
        <div class="col overflow-hidden">
          <div class="text-primary text-weight-bold" style="font-size: 11px;">
            Replying to {{ UserCacheStore.getUsername(replyingToMessage.senderId) || 'User' }}
          </div>
          <div class="text-caption ellipsis text-grey-7" style="font-size: 11px;">
            {{ replyingToMessage.content }}
          </div>
        </div>
        <q-btn flat round dense icon="close" size="sm" @click="cancelReply" />
      </div>

      <div class="row items-end q-gutter-x-sm">
        <input
          ref="fileInputRef"
          type="file"
          multiple
          class="hidden"
          @change="handleFileInput"
        />
        <q-btn
          v-if="!isEditing"
          flat round dense
          icon="attach_file"
          color="grey-7"
          @click="triggerFileInput"
          :disable="!isCurrentUserCanSendMessages"
        >
          <q-tooltip>Attach files</q-tooltip>
        </q-btn>

        <q-input
          ref="messageInputRef"
          v-model="inputModel"
          @keyup.enter="isEditing ? saveEdit() : sendMessage()"
          @input="handleTyping"
          dense
          outlined
          autogrow
          class="col"
          :placeholder="isCurrentUserCanSendMessages ? (isEditing ? 'Edit message...' : 'Type a message...') : 'Sending disabled'"
          :disable="!isCurrentUserCanSendMessages"
          bg-color="input-bg"
        >
          <template v-slot:append>
            <q-btn
              flat round dense
              :icon="isEditing ? 'check' : 'send'"
              :color="isEditing ? 'positive' : 'primary'"
              @click="isEditing ? saveEdit() : sendMessage()"
              :disable="isEditing ? !editContent.trim() : (!message.trim() && pendingFiles.length === 0) || !isCurrentUserCanSendMessages"
            />
          </template>
        </q-input>
      </div>
      
      <div v-if="!isCurrentUserCanSendMessages" class="text-caption text-negative q-mt-xs text-center">
        {{ sendRestrictionMessage || "You can't send messages in this chat." }}
      </div>
    </footer>

  </div>
</template>

<style scoped>
.chat-page-container {
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  background: transparent;
}

.chat-header {
  flex-shrink: 0;
  height: 72px;
  background: white;
  z-index: 20;
}

.body--dark .chat-header {
  background: #1e1e1e;
}

.messages-scroll-area {
  flex-grow: 1;
  overflow-y: auto !important;
  background: #fdfdfd;
}

.body--dark .messages-scroll-area {
  background: #121212;
}

.input-area {
  flex-shrink: 0;
  background: white;
  z-index: 20;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
}

.body--dark .input-area {
  background: #1e1e1e;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
}

.scroll-bottom-btn {
  margin-bottom: 20px;
  margin-right: 20px;
  z-index: 30;
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.body--dark .border-bottom {
  border-color: rgba(255, 255, 255, 0.1);
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.body--dark .border-top {
  border-color: rgba(255, 255, 255, 0.1);
}

.line-height-1 {
  line-height: 1.2;
}

.blocked-notice {
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .blocked-notice {
  background: #2a2a2a;
  border-color: rgba(255,255,255,0.05);
}

.edit-mode-indicator {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .edit-mode-indicator {
  background: rgba(255, 255, 255, 0.05);
}

@keyframes highlight-flash {
  0% { background-color: rgba(25, 118, 210, 0.2); } /* Using rgba version of primary */
  100% { background-color: transparent; }
}

.highlight-message {
  animation: highlight-flash 2s ease-out;
  border-radius: 8px; /* Matching bubble radius */
}

.reply-preview-bar {
  background: rgba(0, 0, 0, 0.05);
  border-left: 3px solid var(--q-primary);
}

.body--dark .reply-preview-bar {
  background: rgba(255, 255, 255, 0.1);
}
</style>
