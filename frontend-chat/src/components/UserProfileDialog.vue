<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { useQuasar } from "quasar"
import { UserApi } from "src/api/apis/user_api"
import type {User} from "src/api/types/register_response"
import CreateDirectChatButton from "components/CreateDirectChatButton.vue";
import AppAvatar from "components/AppAvatar.vue";
import { AuthStore } from "stores/auth_store";

const $q = useQuasar()

const props = defineProps<{
  modelValue: boolean
  userId: string | null
}>()

const emit = defineEmits(["update:modelValue"])

const user = ref<User | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const isBlocked = ref(false)
const isProcessingBlock = ref(false)
const tab = ref("info")

// Текущий пользователь
const currentUserId = computed(() => AuthStore.user?.id)

// Нельзя блокировать себя
const canBlock = computed(() => {
  return currentUserId.value && props.userId && currentUserId.value !== props.userId
})

let loadSeq = 0

//  загрузка при открытии
watch(
  () => props.modelValue,
  async (open) => {
    if (!open || !props.userId) return
    await loadUserData(props.userId)
  }
)

// Также следим за изменением userId, чтобы обновить данные
watch(
  () => props.userId,
  async (newUserId) => {
    if (!newUserId || !props.modelValue) return
    await loadUserData(newUserId)
  }
)

async function loadUserData(targetId: string) {
  const currentSeq = ++loadSeq
  isBlocked.value = false
  user.value = null
  error.value = null

  try {
    isLoading.value = true
    const loadedUser = await UserApi.getSpecificUser(targetId)
    if (currentSeq !== loadSeq) return
    user.value = loadedUser
    await checkBlockStatus(targetId, currentSeq)
  } catch (e) {
    if (currentSeq !== loadSeq) return
    console.error(e)
    error.value = "Failed to load user information"
  } finally {
    if (currentSeq === loadSeq) {
      isLoading.value = false
    }
  }
}

async function checkBlockStatus(targetId: string, seq?: number) {
  try {
    const response = await UserApi.getBlacklist()
    if (typeof seq === 'number' && seq !== loadSeq) return
    isBlocked.value = response.some((u: User) => u.id === targetId)
  } catch (e) {
    console.error('Failed to check block status:', e)
  }
}

function blockUser() {
  const targetId = user.value?.id ?? props.userId
  if (!targetId || !canBlock.value) return

  $q.dialog({
    title: 'Confirm Block',
    message: `Are you sure you want to block ${user.value?.username}? You won't see their messages anymore.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Block', color: 'negative' }
  }).onOk(() => {
    void (async () => {
      try {
        isProcessingBlock.value = true
        await UserApi.blockUser(targetId)
        isBlocked.value = true
        window.dispatchEvent(new Event('block-status-changed'))
        $q.notify({ type: 'positive', message: 'User blocked', position: 'top' })
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to block user', position: 'top' })
      } finally {
        isProcessingBlock.value = false
      }
      })()
      })
      }

      // Разблокировать пользователя
      function unblockUser() {
      const targetId = user.value?.id ?? props.userId
      if (!targetId || !canBlock.value) return

      void (async () => {
      try {
      isProcessingBlock.value = true
      await UserApi.unblockUser(targetId)
      isBlocked.value = false
      window.dispatchEvent(new Event('block-status-changed'))
      $q.notify({ type: 'positive', message: 'User unblocked', position: 'top' })
      } catch {
      $q.notify({ type: 'negative', message: 'Failed to unblock user', position: 'top' })
      } finally {
      isProcessingBlock.value = false
      }
      })()
      }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      loadSeq++
      user.value = null
      error.value = null
      isBlocked.value = false
      isLoading.value = false
      tab.value = "info"
    }
  }
)
</script>

<template>
  <q-dialog
    :model-value="props.modelValue"
    @update:model-value="val => emit('update:modelValue', val)"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="column no-wrap user-profile-card shadow-10">
      
      <!-- CLOSE BUTTON -->
      <div class="row justify-end q-pa-sm absolute-top-right z-top">
        <q-btn flat round dense icon="close" color="grey-7" @click="close" />
      </div>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="flex flex-center" style="height: 400px;">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="error" class="flex flex-center column" style="height: 400px;">
        <q-icon name="error_outline" size="64px" color="negative" />
        <div class="text-h6 text-negative q-mt-md">{{ error }}</div>
        <q-btn label="Retry" color="primary" flat @click="props.userId && loadUserData(props.userId)" />
      </div>

      <!-- CONTENT -->
      <template v-else-if="user">
        <!-- HEADER -->
        <q-card-section class="text-center q-pt-xl header-section">
          <div class="avatar-wrapper q-mx-auto">
            <AppAvatar
              :avatar-id="user.avatarId"
              :name="user.username"
              size="120px"
            />
            <div v-if="isBlocked" class="blocked-badge">
              <q-icon name="block" color="white" size="20px" />
            </div>
          </div>

          <div class="text-h5 text-weight-bold q-mt-md text-primary">
            {{ user.username }}
          </div>

          <div class="text-caption text-grey-7 q-mb-sm">
            {{ user.id }}
          </div>

          <div class="row justify-center q-gutter-x-md q-mt-md">
            <CreateDirectChatButton :userId="user.id" />
          </div>
        </q-card-section>

        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="info" icon="info" label="Details" />
          <q-tab name="actions" icon="security" label="Actions" v-if="canBlock" />
        </q-tabs>

        <q-separator />

        <q-card-section class="col scroll q-pa-none">
          <q-tab-panels v-model="tab" animated class="transparent">
            
            <q-tab-panel name="info" class="q-pa-md">
              <q-list padding class="details-list">
                <q-item>
                  <q-item-section avatar>
                    <q-icon color="primary" name="visibility" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Last activity</q-item-label>
                    <q-item-label>{{ formatDate(user.lastSeenAt) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon color="primary" name="calendar_today" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Joined date</q-item-label>
                    <q-item-label>{{ formatDate(user.createdAt) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="isBlocked">
                  <q-item-section avatar>
                    <q-icon color="negative" name="block" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label color="negative">You have blocked this user</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="actions" class="q-pa-md" v-if="canBlock">
              <div class="text-subtitle2 text-grey-7 q-mb-md uppercase tracking-wider">Privacy Settings</div>
              
              <q-banner v-if="isBlocked" rounded class="bg-negative text-white q-mb-md">
                <template v-slot:avatar>
                  <q-icon name="block" />
                </template>
                This user is currently in your blacklist. You won't receive their messages.
              </q-banner>

              <q-btn
                v-if="!isBlocked"
                color="negative"
                outline
                icon="block"
                label="Block User"
                :loading="isProcessingBlock"
                @click="blockUser"
                class="full-width"
              />
              <q-btn
                v-else
                color="positive"
                outline
                icon="check_circle"
                label="Unblock User"
                :loading="isProcessingBlock"
                @click="unblockUser"
                class="full-width"
              />
            </q-tab-panel>

          </q-tab-panels>
        </q-card-section>
      </template>

    </q-card>
  </q-dialog>
</template>

<style scoped>
.user-profile-card {
  width: 450px;
  max-width: 95vw;
  min-height: 500px;
  max-height: 85vh;
  border-radius: 16px;
  overflow: hidden;
}

.header-section {
  background: #f5f5f5;
}

.body--dark .header-section {
  background: #2a2a2a !important;
}

.avatar-wrapper {
  position: relative;
  width: fit-content;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.body--dark .avatar-wrapper {
  border-color: #333 !important;
}

.blocked-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: var(--q-negative);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.details-list .q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}
</style>
