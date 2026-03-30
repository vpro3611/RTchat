<script setup lang="ts">
import { ref } from "vue"
import { AuthStore } from "stores/auth_store"
import {UserApi} from "src/api/apis/user_api";

const oldPassword = ref("")
const newPassword = ref("")

const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

async function handleSubmit() {
  if (isLoading.value) return

  try {
    isLoading.value = true
    error.value = null
    success.value = null

    const user = await UserApi.changePassword(
      oldPassword.value,
      newPassword.value
    )

    AuthStore.setUser(user)

    success.value = "Password updated successfully"

    oldPassword.value = ""
    newPassword.value = ""

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
      Change Password
    </q-card-section>

    <q-card-section>

      <q-input
        v-model="oldPassword"
        type="password"
        label="Current password"
        dense
        outlined
        class="q-mb-md"
      />

      <q-input
        v-model="newPassword"
        type="password"
        label="New password"
        dense
        outlined
        class="q-mb-md"
      />

      <q-btn
        label="Update password"
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
