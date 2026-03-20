<script setup lang="ts">
import { ref } from "vue"
import { AuthStore } from "stores/auth_store"
import { UserApi } from "src/api/apis/user_api"

const newEmail = ref(AuthStore.user?.email ?? "")

const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

async function handleSubmit() {
  if (isLoading.value) return

  const email = newEmail.value.trim()

  if (!email) {
    error.value = "Email cannot be empty"
    return
  }

  try {
    isLoading.value = true
    error.value = null
    success.value = null

    //  ДОБАВЬ ЭТУ СТРОКУ
    localStorage.setItem("email-flow", "change")

    await UserApi.changeEmail(email)

    success.value = "Verification email sent. Please check your inbox."
    newEmail.value = ""

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
      Change Email
    </q-card-section>

    <q-card-section>

      <q-input
        v-model="newEmail"
        type="email"
        label="New email"
        dense
        outlined
        class="q-mb-md"
      />

      <q-btn
        label="Update email"
        color="primary"
        :loading="isLoading"
        @click="handleSubmit"
      />

      <!-- SUCCESS -->
      <div v-if="success" class="text-positive q-mt-sm">
        {{ success }}
        <div class="text-caption">
          Don't forget to check your spam folder
        </div>
      </div>

      <!-- ERROR -->
      <div v-if="error" class="text-negative q-mt-sm">
        {{ error }}
      </div>

    </q-card-section>

  </q-card>

</template>
