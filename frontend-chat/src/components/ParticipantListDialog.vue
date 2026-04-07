<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import { ParticipantApi } from "src/api/apis/participant_api";
import { ParticipantStore } from "stores/participant_store";
import { AuthStore } from "stores/auth_store";
import type { Participant } from "src/api/types/participant_response";
import ParticipantDetailsDialog from "components/ParticipantDetailsDialog.vue";
import BannedParticipantsDialog from "components/BannedParticipantsDialog.vue";
import ManageRequestsDialog from "components/ManageRequestsDialog.vue";
import UserSearchDialog from "components/UserSearchDialog.vue";
import AppAvatar from "components/AppAvatar.vue";
import AvatarUpload from "components/AvatarUpload.vue";
import { ChatStore } from "stores/chat_store";
import { UserCacheStore } from "stores/user_cache_store";
import { watch } from "vue";

const $q = useQuasar();

const props = defineProps<{
  conversationId: string;
  conversationType: 'direct' | 'group';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Состояние
const isOpen = ref(false);
const isLoading = ref(false);
const isLoadingMore = ref(false);

// Диалоги
const detailsDialogRef = ref<{ openDialog: (participant: Participant) => void } | null>(null);
const bannedDialogRef = ref<{ openDialog: () => void } | null>(null);
const requestsDialogRef = ref<{ open: () => void } | null>(null);
const showAddUserSearch = ref(false);
const isAvatarLoading = ref(false);

// Текущий пользователь
const currentUserId = computed(() => AuthStore.user?.id);

// Является ли текущий пользователь владельцем
const isOwner = computed(() => {
  const current = ParticipantStore.participants.find(p => p.userId === currentUserId.value);
  return current?.role === 'owner';
});

// Загрузка участников
async function loadParticipants() {
  if (!props.conversationId) return;

  isLoading.value = true;
  ParticipantStore.setLoading(true);

  try {
    const response = await ParticipantApi.getParticipants(props.conversationId);
    ParticipantStore.setParticipants(response.items, response.nextCursor);
  } catch (e) {
    console.error('Failed to load participants:', e);
    $q.notify({ type: 'negative', message: 'Failed to load participants' });
  } finally {
    isLoading.value = false;
    ParticipantStore.setLoading(false);
  }
}

// Загрузка ещё участников
async function loadMore() {
  if (!props.conversationId || !ParticipantStore.hasMore || isLoadingMore.value) return;

  isLoadingMore.value = true;
  try {
    const response = await ParticipantApi.getParticipants(
      props.conversationId,
      ParticipantStore.nextCursor ?? undefined
    );
    ParticipantStore.appendParticipants(response.items, response.nextCursor);
  } catch (e) {
    console.error('Failed to load more participants:', e);
  } finally {
    isLoadingMore.value = false;
  }
}

// Клик на участника - открыть детали
function openParticipantDetails(participant: Participant) {
  detailsDialogRef.value?.openDialog(participant);
}

// Открыть список забаненных
function openBannedList() {
  bannedDialogRef.value?.openDialog();
}

// Открыть список запросов
function openRequestsList() {
  requestsDialogRef.value?.open();
}

function openAddUserSearch() {
  showAddUserSearch.value = true;
}

function onUserAdded(participant?: Participant) {
  if (participant) {
    ParticipantStore.addParticipant(participant);
  } else {
    void loadParticipants();
  }
}

async function handleAvatarUpload(file: File) {
  isAvatarLoading.value = true
  try {
    const res = await ParticipantApi.setConversationAvatar(props.conversationId, file)
    ChatStore.updateChatAvatar(props.conversationId, res.avatarId)
    $q.notify({
      type: "positive",
      message: "Group avatar updated"
    })
  } catch (e) {
    $q.notify({
      type: "negative",
      message: e instanceof Error ? e.message : "Failed to upload avatar"
    })
  } finally {
    isAvatarLoading.value = false
  }
}

async function handleAvatarDelete() {
  isAvatarLoading.value = true
  try {
    await ParticipantApi.deleteConversationAvatar(props.conversationId)
    ChatStore.updateChatAvatar(props.conversationId, null)
    $q.notify({
      type: "positive",
      message: "Group avatar removed"
    })
  } catch (e) {
    $q.notify({
      type: "negative",
      message: e instanceof Error ? e.message : "Failed to delete avatar"
    })
  } finally {
    isAvatarLoading.value = false
  }
}

// Синхронизируем участников с кэшем пользователей для получения актуальных аватаров
watch(
  () => ParticipantStore.participants,
  (list) => {
    const userIds = list.map(p => p.userId);
    void UserCacheStore.ensureUsers(userIds);
  },
  { immediate: true, deep: true }
);

// Открыть диалог
function openDialog() {
  ParticipantStore.clearParticipants();
  isOpen.value = true;
  void loadParticipants();
}

defineExpose({ openDialog });
</script>

<template>
  <q-dialog
    v-model="isOpen"
    persistent
    @update:model-value="(val) => !val && emit('close')"
  >
    <q-card style="min-width: 350px; max-width: 90vw; max-height: 80vh;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Participants</div>
        <q-space />
        <q-btn v-if="isOwner && props.conversationType === 'group'" 
               flat round dense color="primary" icon="person_add" 
               @click="openAddUserSearch" class="q-mr-sm">
          <q-tooltip>Add User</q-tooltip>
        </q-btn>
        <q-btn v-if="isOwner && props.conversationType === 'group'" 
               flat round dense color="orange" icon="group_add" 
               @click="openRequestsList" class="q-mr-sm">
          <q-tooltip>Join Requests</q-tooltip>
        </q-btn>
        <q-btn v-if="isOwner && props.conversationType === 'group'" 
               flat round dense color="negative" icon="gavel" 
               @click="openBannedList" class="q-mr-sm">
          <q-tooltip>Banned List</q-tooltip>
        </q-btn>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- Аватар группы для владельца -->
        <div v-if="isOwner && props.conversationType === 'group'" class="row justify-center q-mb-md">
          <AvatarUpload
            :avatar-id="ChatStore.findById(props.conversationId)?.avatarId"
            :name="ChatStore.findById(props.conversationId)?.title"
            :loading="isAvatarLoading"
            can-delete
            size="100px"
            @upload="handleAvatarUpload"
            @delete="handleAvatarDelete"
          />
        </div>

        <!-- Загрузка -->
        <div v-if="isLoading" class="flex flex-center q-pa-lg">
          <q-spinner-dots size="40px" color="primary" />
        </div>

        <!-- Список участников -->
        <div v-else-if="ParticipantStore.participants.length > 0" class="scroll" style="max-height: 400px;">
          <q-list separator>
            <q-item
              v-for="participant in ParticipantStore.participants"
              :key="participant.userId"
              clickable
              @click="openParticipantDetails(participant)"
            >
              <q-item-section avatar>
                <AppAvatar
                  :avatar-id="UserCacheStore.getAvatarId(participant.userId) || participant.avatarId"
                  :name="participant.username"
                  :is-online="UserCacheStore.isOnline[participant.userId]"
                  size="40px"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ participant.username }}
                  <q-badge v-if="participant.userId === currentUserId" color="grey" label="You" class="q-ml-sm" />
                  <q-badge v-if="participant.role === 'owner'" color="warning" text-color="black" label="Owner" class="q-ml-xs" />
                </q-item-label>
                <q-item-label caption>
                  {{ participant.email }}
                  <span v-if="participant.mutedUntil" class="text-negative q-ml-sm">
                    (muted)
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Кнопка загрузки ещё -->
          <div v-if="ParticipantStore.hasMore" class="text-center q-pa-sm">
            <q-btn
              flat
              :loading="isLoadingMore"
              label="Load more"
              @click="loadMore"
            />
          </div>
        </div>

        <!-- Пусто -->
        <div v-else class="text-grey text-center q-pa-lg">
          No participants yet
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>

    <!-- Диалог деталей участника -->
    <ParticipantDetailsDialog
      ref="detailsDialogRef"
      :conversationId="conversationId"
      :currentUserId="currentUserId ?? ''"
      :isOwner="isOwner"
    />

    <!-- Диалог забаненных участников -->
    <BannedParticipantsDialog
      ref="bannedDialogRef"
      :conversationId="conversationId"
      :isOwner="isOwner"
    />

    <!-- Диалог запросов на вступление -->
    <ManageRequestsDialog
      ref="requestsDialogRef"
      :conversationId="conversationId"
      @accepted="onUserAdded"
    />

    <!-- Поиск пользователей для добавления -->
    <UserSearchDialog
      v-model="showAddUserSearch"
      :conversationId="conversationId"
      @added="onUserAdded"
    />
  </q-dialog>
</template>
