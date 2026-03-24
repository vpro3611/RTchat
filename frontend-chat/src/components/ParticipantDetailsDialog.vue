<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { ParticipantApi } from "src/api/apis/participant_api";
import { UserApi } from "src/api/apis/user_api";
import type { User } from "src/api/types/register_response";
import { ParticipantStore } from "stores/participant_store";
import type { Participant, ParticipantRole, MuteDuration } from "src/api/types/participant_response";

const $q = useQuasar();

const props = defineProps<{
  conversationId: string;
  currentUserId: string;
  isOwner: boolean;
}>();

// Состояние
const isOpen = ref(false);
const participant = ref<Participant | null>(null);
const isLoading = ref(false);
const isBlocked = ref(false);
const isProcessingBlock = ref(false);

// Computed для безопасного доступа в шаблоне
const currentParticipant = computed((): Participant => {
  const p = participant.value;
  return p ?? { conversationId: '', userId: '', username: '', email: '', role: 'member', canSendMessages: true, mutedUntil: null, joinedAt: '' };
});

// Можно ли управлять этим участником (не себя, и мы owner)
const canManage = computed(() => {
  if (!participant.value) return false;
  return props.isOwner && participant.value.userId !== props.currentUserId;
});

// Можно ли заблокировать участника (не себя)
const canBlock = computed(() => {
  if (!participant.value) return false;
  return participant.value.userId !== props.currentUserId;
});

let loadSeq = 0

// Открыть диалог деталей
async function openDialog(p: Participant) {
  const currentSeq = ++loadSeq

  // Сбрасываем состояние перед загрузкой
  isBlocked.value = false;
  isLoading.value = false;

  participant.value = p;
  isOpen.value = true;

  await checkBlockStatus(p.userId, currentSeq)

  // Загружаем полную информацию
  await loadFullInfo(currentSeq);
}

// Следим за изменением participant, чтобы обновить статус блокировки
watch(participant, async (newParticipant) => {
  if (newParticipant && isOpen.value) {
    const currentSeq = ++loadSeq
    isBlocked.value = false;
    await checkBlockStatus(newParticipant.userId, currentSeq);
  }
});

// FIX : FIXED stale-state race при быстром открытии/закрытии ParticipantDetailsDialog
// Загрузить полную информацию об участнике
async function loadFullInfo(seq: number) {
  const p = participant.value;
  if (!p || !props.conversationId) return;

  isLoading.value = true;
  try {
    const response = await ParticipantApi.getSpecificParticipant(
      props.conversationId,
      p.userId
    );
    if (seq !== loadSeq) return
    participant.value = response.participant;
    await checkBlockStatus(response.participant.userId, seq)
  } catch (e) {
    if (seq !== loadSeq) return
    console.error('Failed to load participant details:', e);
    $q.notify({ type: 'negative', message: 'Failed to load details' });
  } finally {
    if (seq === loadSeq) {
      isLoading.value = false;
    }
  }
}

// Проверить статус блокировки
async function checkBlockStatus(targetId: string, seq?: number) {
  try {
    const response = await UserApi.getBlacklist();
    if (typeof seq === 'number' && seq !== loadSeq) return
    isBlocked.value = response.some((u: User) => u.id === targetId);
  } catch (e) {
    console.error('Failed to check block status:', e);
  }
}

// Заблокировать пользователя
function blockUser() {
  const p = participant.value;
  if (!p || !canBlock.value) return;

  $q.dialog({
    title: 'Block User',
    message: `Are you sure you want to block ${p.username}? You won't be able to see their messages or create conversations with them.`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Block',
      color: 'negative',
    },
  }).onOk(() => {
    void (async () => {
      try {
        isProcessingBlock.value = true;
        await UserApi.blockUser(p.userId);
        isBlocked.value = true;
        window.dispatchEvent(new Event('block-status-changed'));
        $q.notify({ type: 'positive', message: `User ${p.username} has been blocked` });
      } catch (e) {
        console.error('Failed to block user:', e);
        $q.notify({ type: 'negative', message: 'Failed to block user' });
      } finally {
        isProcessingBlock.value = false;
      }
    })();
  });
}

// Разблокировать пользователя
function unblockUser() {
  const p = participant.value;
  if (!p || !canBlock.value) return;

  void (async () => {
    try {
      isProcessingBlock.value = true;
      await UserApi.unblockUser(p.userId);
      isBlocked.value = false;
      window.dispatchEvent(new Event('block-status-changed'));
      $q.notify({ type: 'positive', message: `User ${p.username} has been unblocked` });
    } catch (e) {
      console.error('Failed to unblock user:', e);
      $q.notify({ type: 'negative', message: 'Failed to unblock user' });
    } finally {
      isProcessingBlock.value = false;
    }
  })()
}

// Изменить роль
async function changeRole(newRole: ParticipantRole) {
  const p = participant.value;
  if (!p || !canManage.value) return;

  try {
    const response = await ParticipantApi.changeRole(props.conversationId, p.userId, newRole);
    participant.value = response.participant;
    ParticipantStore.updateParticipant(p.userId, response.participant);
    $q.notify({ type: 'positive', message: `Role changed to ${newRole}` });
  } catch (e) {
    console.error('Failed to change role:', e);
    $q.notify({ type: 'negative', message: 'Failed to change role' });
  }
}

// Мут участника
function showMuteDialog() {
  const p = participant.value;
  if (!p || !canManage.value) return;

  const options: { label: string; value: MuteDuration }[] = [
    { label: '1 hour', value: '1h' },
    { label: '8 hours', value: '8h' },
    { label: '1 day', value: '1d' },
    { label: '1 week', value: '1w' },
    { label: 'Forever', value: 'forever' },
  ];

  $q.dialog({
    title: 'Mute participant',
    message: 'Select mute duration:',
    options: {
      type: 'radio',
      model: '1h',
      items: options,
    },
    cancel: true,
    persistent: true,
  }).onOk((duration: MuteDuration) => {
    void muteParticipant(duration);
  });
}

async function muteParticipant(duration: MuteDuration) {
  const p = participant.value;
  if (!p || !canManage.value) return;

  try {
    const response = await ParticipantApi.muteParticipant(props.conversationId, p.userId, duration);
    participant.value = response.participant;
    ParticipantStore.updateParticipant(p.userId, response.participant);
    $q.notify({ type: 'positive', message: 'Participant muted' });
  } catch (e) {
    console.error('Failed to mute:', e);
    $q.notify({ type: 'negative', message: 'Failed to mute participant' });
  }
}

// Анмут
async function unmuteParticipant() {
  const p = participant.value;
  if (!p || !canManage.value) return;

  try {
    const response = await ParticipantApi.unmuteParticipant(props.conversationId, p.userId);
    participant.value = response.participant;
    ParticipantStore.updateParticipant(p.userId, response.participant);
    $q.notify({ type: 'positive', message: 'Participant unmuted' });
  } catch (e) {
    console.error('Failed to unmute:', e);
    $q.notify({ type: 'negative', message: 'Failed to unmute participant' });
  }
}

// Кик участника
function showKickDialog() {
  const p = participant.value;
  if (!p || !canManage.value) return;

  $q.dialog({
    title: 'Remove participant',
    message: `Are you sure you want to remove ${p.username} from this group?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Remove',
      color: 'negative',
    },
  }).onOk(() => {
    void kickParticipant();
  });
}

async function kickParticipant() {
  const p = participant.value;
  if (!p || !canManage.value) return;

  try {
    await ParticipantApi.kickParticipant(props.conversationId, p.userId);
    ParticipantStore.removeParticipant(p.userId);
    $q.notify({ type: 'positive', message: 'Participant removed' });
    isOpen.value = false;
  } catch (e) {
    console.error('Failed to kick:', e);
    $q.notify({ type: 'negative', message: 'Failed to remove participant' });
  }
}

// Форматирование времени
function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString();
}

// Закрытие диалога
function onDialogClose() {
  loadSeq++
  participant.value = null;
  isBlocked.value = false;
  isLoading.value = false;
}

defineExpose({ openDialog });
</script>

<template>
  <q-dialog v-model="isOpen" persistent @hide="onDialogClose">
    <q-card style="min-width: 300px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Participant Details</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="isLoading" class="flex flex-center q-pa-lg">
        <q-spinner-dots size="40px" color="primary" />
      </q-card-section>

      <q-card-section v-if="currentParticipant">
        <!-- Информация об участнике -->
        <div class="column items-center q-pa-md">
          <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
            {{ currentParticipant.username.charAt(0).toUpperCase() }}
          </q-avatar>

          <div class="text-h6">{{ currentParticipant.username }}</div>
          <div class="text-caption text-grey">{{ currentParticipant.email }}</div>

          <div class="row q-gutter-sm q-mt-md">
            <q-badge v-if="currentParticipant.userId === currentUserId" color="grey" label="You" />
            <q-badge v-if="currentParticipant.role === 'owner'" color="warning" text-color="black" label="Owner" />
          </div>

          <div class="full-width q-mt-md">
            <q-list dense bordered separator class="rounded-borders">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Can send messages</q-item-label>
                  <q-item-label>{{ currentParticipant.canSendMessages ? 'Yes' : 'No' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="currentParticipant.mutedUntil">
                <q-item-section>
                  <q-item-label caption>Muted until</q-item-label>
                  <q-item-label class="text-negative">{{ formatDate(currentParticipant.mutedUntil) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Joined</q-item-label>
                  <q-item-label>{{ formatDate(currentParticipant.joinedAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Действия для владельца -->
        <div v-if="canManage" class="q-pa-md">
          <q-list bordered separator class="rounded-borders">
            <!-- Изменить роль -->
            <q-item
              clickable
              @click="changeRole(currentParticipant.role === 'owner' ? 'member' : 'owner')"
            >
              <q-item-section>
                {{ currentParticipant.role === 'owner' ? 'Remove owner' : 'Make owner' }}
              </q-item-section>
            </q-item>

            <!-- Мут/анмут -->
            <q-item
              v-if="currentParticipant.mutedUntil"
              clickable
              @click="unmuteParticipant"
            >
              <q-item-section class="text-positive">Unmute</q-item-section>
            </q-item>
            <q-item v-else clickable @click="showMuteDialog">
              <q-item-section>Mute</q-item-section>
            </q-item>

            <!-- Кик -->
            <q-item clickable @click="showKickDialog">
              <q-item-section class="text-negative">Remove from group</q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Блок/разблок для всех (кроме себя) -->
        <div v-if="canBlock" class="q-pa-md">
          <q-list bordered separator class="rounded-borders">
            <!-- Блок/разблок пользователя -->
            <q-item
              v-if="!isBlocked"
              clickable
              @click="blockUser"
              :disable="isProcessingBlock"
            >
              <q-item-section class="text-negative">
                <q-icon name="block" class="q-mr-xs" />
                Block User (Affects only your direct chats)
              </q-item-section>
            </q-item>
            <q-item
              v-else
              clickable
              @click="unblockUser"
              :disable="isProcessingBlock"
            >
              <q-item-section class="text-positive">
                <q-icon name="check_circle" class="q-mr-xs" />
                Unblock User
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Статус блокировки -->
          <div v-if="isBlocked" class="q-mt-sm text-negative text-center text-caption">
            <q-icon name="block" class="q-mr-xs" />
            You have blocked this user
          </div>
        </div>

        <!-- Сообщение если нельзя управлять -->
        <div v-else-if="!isOwner && currentParticipant.userId !== currentUserId" class="text-center q-pa-md text-grey">
          You don't have permission to manage this participant
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
