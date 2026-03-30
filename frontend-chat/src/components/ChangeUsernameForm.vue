<script setup lang="ts">
import { ref } from "vue"
import { AuthStore } from "stores/auth_store"
import {UserApi} from "src/api/apis/user_api";

const newUsername = ref(AuthStore.user?.username ?? "")

const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

async function handleSubmit() {
  if (isLoading.value) return

  const username = newUsername.value.trim()

  if (!username) {
    error.value = "Username cannot be empty"
    return
  }

  try {
    isLoading.value = true
    error.value = null
    success.value = null

    const user = await UserApi.changeUsername(username)

    AuthStore.setUser(user)

    success.value = "Username updated successfully"
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <q-card flat bordered class="q-mt-md">

    <q-card-section class="text-h6">
      Change Username
    </q-card-section>

    <q-card-section>

      <q-input
        v-model="newUsername"
        label="New username"
        dense
        outlined
        class="q-mb-md"
      />

      <q-btn
        label="Update username"
        color="primary"
        :loading="isLoading"
        @click="handleSubmit"
      />

      <div v-if="success" class="text-positive q-mt-sm">
        {{ success }}
      </div>

      <div v-if="error" class="text-negative q-mt-sm">
        {{ error }}
      </div>

    </q-card-section>

  </q-card>
</template>
