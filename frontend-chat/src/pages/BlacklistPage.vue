<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { UserApi } from "src/api/apis/user_api";
import type { User } from "src/api/types/register_response";
import UserProfileDialog from "components/UserProfileDialog.vue";

const $q = useQuasar();
const router = useRouter();

const blockedUsers = ref<User[]>([]);
const isLoading = ref(false);
const isRemoving = ref<string | null>(null);
const selectedUserId = ref<string | null>(null);
const isUserProfileOpen = ref(false);

// Загрузить чёрный список
async function loadBlacklist() {
  isLoading.value = true;
  try {
    const response = await UserApi.getBlacklist();
    blockedUsers.value = response;
  } catch (e) {
    console.error('Failed to load blacklist:', e);
    $q.notify({ type: 'negative', message: 'Failed to load blacklist' });
  } finally {
    isLoading.value = false;
  }
}

// Разблокировать пользователя
function unblockUser(userId: string, username: string) {
  $q.dialog({
    title: 'Unblock User',
    message: `Do you want to unblock ${username}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Unblock',
      color: 'positive',
    },
  }).onOk(() => {
    isRemoving.value = userId;
    void (async () => {
      try {
        await UserApi.unblockUser(userId);
        blockedUsers.value = blockedUsers.value.filter(u => u.id !== userId);
        window.dispatchEvent(new Event('block-status-changed'));
        $q.notify({ type: 'positive', message: `User ${username} has been unblocked` });
      } catch (e) {
        console.error('Failed to unblock user:', e);
        $q.notify({ type: 'negative', message: 'Failed to unblock user' });
      } finally {
        isRemoving.value = null;
      }
    })();
  });
}

// Открыть профиль пользователя
function openUserProfile(userId: string) {
  selectedUserId.value = userId;
  isUserProfileOpen.value = true;
}

// Форматирование даты
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

onMounted(() => {
  void loadBlacklist();
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn 
        flat 
        round 
        icon="arrow_back" 
        @click="router.back()"
        class="q-mr-sm"
      />
      <div class="text-h5">Blocked Users</div>
    </div>

    <q-separator class="q-mb-md" />

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- Empty state -->
    <div v-else-if="blockedUsers.length === 0" class="text-grey text-center q-pa-xl">
      <q-icon name="block" size="64px" class="q-mb-md" />
      <div class="text-h6">No blocked users</div>
      <div class="text-caption">Users you block will appear here</div>
    </div>

    <!-- Blocked users list -->
    <q-list v-else bordered separator class="rounded-borders">
      <q-item
        v-for="user in blockedUsers"
        :key="user.id"
        clickable
        @click="openUserProfile(user.id)"
      >
        <q-item-section avatar>
          <q-avatar color="negative" text-color="white">
            {{ user.username.charAt(0).toUpperCase() }}
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ user.username }}</q-item-label>
          <q-item-label caption>
            Blocked on {{ formatDate(user.updatedAt) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn
            flat
            round
            color="positive"
            icon="check_circle"
            :loading="isRemoving === user.id"
            @click.stop="unblockUser(user.id, user.username)"
          >
            <q-tooltip>Unblock</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <UserProfileDialog
      v-model="isUserProfileOpen"
      :user-id="selectedUserId"
      @update:model-value="(val) => { if (!val) void loadBlacklist() }"
    />
  </q-page>
</template>
