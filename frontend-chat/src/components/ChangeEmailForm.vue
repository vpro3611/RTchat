<script setup lang="ts">
import { ref } from "vue"
import { AuthStore } from "stores/auth_store"
import { UserApi } from "src/api/apis/user_api"

const newEmail = ref(AuthStore.user?.email ?? "")

const isLoading = ref(false)
const isResendLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const resendSuccess = ref<string | null>(null)
const hasRequestedChange = ref(false)

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
    resendSuccess.value = null

    await UserApi.changeEmail(email)

    success.value = "Verification email sent. Please check your inbox."
    hasRequestedChange.value = true
    newEmail.value = ""

  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

async function handleResendChangeEmailVerification() {
  if (isResendLoading.value || !hasRequestedChange.value) return

  try {
    isResendLoading.value = true
    error.value = null
    resendSuccess.value = null

    await UserApi.resendChangeEmailVerification()
    resendSuccess.value = "Verification email sent again. Please check your inbox."
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isResendLoading.value = false
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
        :disable="isResendLoading"
        @click="handleSubmit"
      />

      <q-btn
        class="q-ml-sm"
        label="Resend verification"
        color="secondary"
        flat
        :loading="isResendLoading"
        :disable="!hasRequestedChange || isLoading"
        @click="handleResendChangeEmailVerification"
      />

      <!-- SUCCESS -->
      <div v-if="success" class="text-positive q-mt-sm">
        {{ success }}
        <div class="text-caption">
          Don't forget to check your spam folder
        </div>
      </div>

      <div v-if="resendSuccess" class="text-positive q-mt-sm">
        {{ resendSuccess }}
      </div>

      <!-- ERROR -->
      <div v-if="error" class="text-negative q-mt-sm">
        {{ error }}
      </div>

    </q-card-section>

  </q-card>

</template>
