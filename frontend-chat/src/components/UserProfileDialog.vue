<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { useQuasar } from "quasar"
import { UserApi } from "src/api/apis/user_api"
import type {User} from "src/api/types/register_response"
import CreateDirectChatButton from "components/CreateDirectChatButton.vue";
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

// FIX : FIXED stale-state race между открытиями/закрытиями диалога
// Загрузить данные пользователя и статус блокировки
async function loadUserData(targetId: string) {
  const currentSeq = ++loadSeq

  // Сбрасываем состояние
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
    error.value = "Failed to load user"
  } finally {
    if (currentSeq === loadSeq) {
      isLoading.value = false
    }
  }
}

// Проверить статус блокировки
async function checkBlockStatus(targetId: string, seq?: number) {
  try {
    const response = await UserApi.getBlacklist()
    if (typeof seq === 'number' && seq !== loadSeq) return
    isBlocked.value = response.some((u: User) => u.id === targetId)
  } catch (e) {
    console.error('Failed to check block status:', e)
  }
}

// Заблокировать пользователя
function blockUser() {
  const targetId = user.value?.id ?? props.userId
  if (!targetId || !canBlock.value) return

  $q.dialog({
    title: 'Block User',
    message: `Are you sure you want to block ${user.value?.username}? You won't be able to see their messages or create conversations with them.`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Block',
      color: 'negative',
    },
  }).onOk(() => {
    void (async () => {
      try {
        isProcessingBlock.value = true
        await UserApi.blockUser(targetId)
        isBlocked.value = true
        window.dispatchEvent(new Event('block-status-changed'))
        $q.notify({ type: 'positive', message: `User ${user.value?.username} has been blocked` })
      } catch (e) {
        console.error('Failed to block user:', e)
        $q.notify({ type: 'negative', message: 'Failed to block user' })
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
      $q.notify({ type: 'positive', message: `User ${user.value?.username} has been unblocked` })
    } catch (e) {
      console.error('Failed to unblock user:', e)
      $q.notify({ type: 'negative', message: 'Failed to unblock user' })
    } finally {
      isProcessingBlock.value = false
    }
  })()
}

//  очистка при закрытии
watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      loadSeq++
      user.value = null
      error.value = null
      isBlocked.value = false
      isLoading.value = false
    }
  }
)
</script>

<template>
  <q-dialog
    :model-value="props.modelValue"
    @update:model-value="val => emit('update:modelValue', val)"
  >
    <q-card style="width: 400px; max-width: 90vw;">

      <q-card-section>
        <div class="text-h6">User Profile</div>
      </q-card-section>

      <q-separator />

      <q-card-section>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center q-pa-md">
          Loading...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-negative text-center q-pa-md">
          {{ error }}
        </div>

        <!-- User -->
        <div v-else-if="user">

          <div class="text-subtitle1">
            {{ user.username }}
          </div>

          <div class="text-grey">
            ID: {{ user.id }}
          </div>

          <div class="text-grey">
            Created at: {{ user.createdAt }}
          </div>

          <div class="text-grey">
            Last seen at: {{ user.lastSeenAt }}
          </div>

          <div class="text-grey q-mt-md">
            <CreateDirectChatButton :userId="user.id" />
          </div>

          <!-- Block/Unblock buttons -->
          <div v-if="canBlock" class="q-mt-md">
            <q-btn
              v-if="!isBlocked"
              color="negative"
              icon="block"
              label="Block User"
              :loading="isProcessingBlock"
              @click="blockUser"
              class="full-width"
            />
            <q-btn
              v-else
              color="positive"
              icon="check_circle"
              label="Unblock User"
              :loading="isProcessingBlock"
              @click="unblockUser"
              class="full-width"
            />
          </div>

          <!-- Blocked status message -->
          <div v-if="isBlocked" class="q-mt-md text-negative text-center">
            <q-icon name="block" class="q-mr-xs" />
            You have blocked this user
          </div>

          <!-- сюда потом можно добавить -->
          <!-- avatar, bio, last seen и т.д. -->

        </div>

      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>


    </q-card>
  </q-dialog>
</template>
