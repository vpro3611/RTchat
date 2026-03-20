<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import { AuthApi } from "src/api/apis/auth_api"

const route = useRoute()

const email = ref(typeof route.query.email === "string" ? route.query.email : "")
const resendLoading = ref(false)
const resendError = ref<string | null>(null)
const resendSuccess = ref<string | null>(null)

const canResend = computed(() => email.value.trim().length > 0)

async function handleResend() {
  if (resendLoading.value || !canResend.value) return

  try {
    resendLoading.value = true
    resendError.value = null
    resendSuccess.value = null

    await AuthApi.resendVerificationRegister(email.value.trim())
    resendSuccess.value = "Verification email sent again. Please check your inbox."
  } catch (e: unknown) {
    resendError.value = e instanceof Error ? e.message : String(e)
  } finally {
    resendLoading.value = false
  }
}
</script>

<template>
  <section class="container">
    <h2>Verify your email</h2>

    <p>
      We sent you a verification email.
      Please check your inbox and click the verification link.
    </p>

    <p>
      After verifying your email you can continue using this application.
    </p>

    <div class="q-mt-md">
      <q-input
        v-model="email"
        type="email"
        label="Email used for registration"
        outlined
        dense
      />
    </div>

    <div class="q-mt-sm">
      <q-btn
        color="primary"
        :loading="resendLoading"
        :disable="!canResend"
        label="Resend verification email"
        @click="handleResend"
      />
    </div>

    <p v-if="resendSuccess" class="text-positive q-mt-sm">
      {{ resendSuccess }}
    </p>

    <p v-if="resendError" class="text-negative q-mt-sm">
      {{ resendError }}
    </p>

  </section>
</template>
