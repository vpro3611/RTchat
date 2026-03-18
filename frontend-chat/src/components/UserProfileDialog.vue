<script setup lang="ts">
import { ref, watch } from "vue"
import { UserApi } from "src/api/apis/user_api"
import type {User} from "src/api/types/register_response"
const props = defineProps<{
  modelValue: boolean
  userId: string | null
}>()

const emit = defineEmits(["update:modelValue"])

const user = ref<User | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

//  загрузка при открытии
watch(
  () => props.modelValue,
  async (open) => {
    if (!open || !props.userId) return

    try {
      isLoading.value = true
      error.value = null

      user.value = await UserApi.getSpecificUser(props.userId)

    } catch (e) {
      console.error(e)
      error.value = "Failed to load user"
    } finally {
      isLoading.value = false
    }
  }
)

//  очистка при закрытии
watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      user.value = null
      error.value = null
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
