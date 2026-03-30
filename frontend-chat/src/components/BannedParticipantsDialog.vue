<script setup lang="ts">
import { ref } from "vue";
import { useQuasar } from "quasar";
import { ParticipantApi } from "src/api/apis/participant_api";
import { UserCacheStore } from "stores/user_cache_store";
import type { ConversationBansFrontend } from "src/api/types/conversation_bans_response";

const $q = useQuasar();

const props = defineProps<{
  conversationId: string;
  isOwner: boolean;
}>();

// const emit = defineEmits<{
//   (e: 'close'): void;
// }>();

// Состояние
const isOpen = ref(false);
const isLoading = ref(false);
const bannedList = ref<ConversationBansFrontend[]>([]);

// Загрузка списка забаненных
async function loadBannedList() {
  if (!props.conversationId) return;

  isLoading.value = true;
  try {
    const response = await ParticipantApi.getBannedParticipantsList(props.conversationId);
    bannedList.value = response;

    // Предзагрузка имен пользователей
    const userIds = response.map(b => b.userId);
    if (userIds.length > 0) {
      await UserCacheStore.ensureUsers(userIds);
    }
  } catch (e) {
    console.error('Failed to load banned list:', e);
    $q.notify({ type: 'negative', message: 'Failed to load banned list' });
  } finally {
    isLoading.value = false;
  }
}

// Разбан участника
 function unbanParticipant(ban: ConversationBansFrontend) {
  const username = UserCacheStore.getUsername(ban.userId) || ban.userId;

  $q.dialog({
    title: 'Unban participant',
    message: `Are you sure you want to unban ${username}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Unban',
      color: 'positive',
    },
  }).onOk( () => {
    try {
      void ParticipantApi.unbanGroupParticipant(props.conversationId, ban.userId);
      $q.notify({ type: 'positive', message: `${username} has been unbanned` });
      // Обновляем список локально
      bannedList.value = bannedList.value.filter(b => b.userId !== ban.userId);
    } catch (e) {
      console.error('Failed to unban:', e);
      $q.notify({ type: 'negative', message: 'Failed to unban participant' });
    }
  });
}

// Получить имя из кэша
function getUsername(userId: string) {
  return UserCacheStore.getUsername(userId) || 'Loading...';
}

// Форматирование даты
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

// Открыть диалог
function openDialog() {
  isOpen.value = true;
  void loadBannedList();
}

defineExpose({ openDialog });
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 400px; max-width: 90vw; max-height: 80vh;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Banned Participants</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- Загрузка -->
        <div v-if="isLoading" class="flex flex-center q-pa-lg">
          <q-spinner-dots size="40px" color="primary" />
        </div>

        <!-- Список забаненных -->
        <div v-else-if="bannedList.length > 0" class="scroll" style="max-height: 400px;">
          <q-list separator bordered class="rounded-borders">
            <q-item
              v-for="ban in bannedList"
              :key="ban.userId"
              class="q-py-md transition-all hover-row"
            >
              <q-item-section avatar>
                <q-avatar color="negative" text-color="white" icon="gavel" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ getUsername(ban.userId) }}
                </q-item-label>
                <q-item-label caption>
                  Reason: {{ ban.reason || 'No reason provided' }}
                </q-item-label>
                <q-item-label caption class="text-grey-7">
                  Banned on: {{ formatDate(ban.createdAt) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="isOwner">
                <q-btn
                  flat
                  round
                  color="positive"
                  icon="check_circle"
                  @click="unbanParticipant(ban)"
                >
                  <q-tooltip>Unban Participant</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Пусто -->
        <div v-else class="text-grey text-center q-pa-lg">
          No banned participants in this group
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.hover-row:hover {
  background: rgba(0, 0, 0, 0.03);
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
