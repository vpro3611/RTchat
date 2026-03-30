<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import { AuthApi } from "src/api/apis/auth_api"

type FlowType = "register" | "change" | "reset-pass" | "reset-activity"

const route = useRoute()

const email = ref(typeof route.query.email === "string" ? route.query.email : "")
const flowType = computed<FlowType>(() => {
  const type = route.query.type
  if (type === "change") return "change"
  if (type === "reset-pass") return "reset-pass"
  if (type === "reset-activity") return "reset-activity"
  return "register"
})

const resendLoading = ref(false)
const resendError = ref<string | null>(null)
const resendSuccess = ref<string | null>(null)

const canResend = computed(() => email.value.trim().length > 0)

const contentMap = {
  register: {
    title: "Verify your email",
    desc: "We sent you a verification email. Please check your inbox and click the verification link to activate your account."
  },
  change: {
    title: "Confirm email change",
    desc: "We sent a confirmation link to your new email address. Please click it to complete the update."
  },
  "reset-pass": {
    title: "Confirm password reset",
    desc: "We sent a reset link to your email. Please click it to confirm your new password."
  },
  "reset-activity": {
    title: "Confirm account restoration",
    desc: "We sent a reactivation link to your email. Please click it to restore your account."
  }
}

const currentContent = computed(() => contentMap[flowType.value])

async function handleResend() {
  if (resendLoading.value || !canResend.value) return

  try {
    resendLoading.value = true
    resendError.value = null
    resendSuccess.value = null

    const trimmedEmail = email.value.trim()

    if (flowType.value === "register") {
      await AuthApi.resendVerificationRegister(trimmedEmail)
    } else if (flowType.value === "reset-pass") {
      await AuthApi.resendResetPassword(trimmedEmail)
    } else if (flowType.value === "reset-activity") {
      await AuthApi.resendResetActivity(trimmedEmail)
    } else {
      // For email change, we need to send the current user ID if it's not in query
      // but usually change flow relies on the session or a known email.
      // Assuming resend-change-email logic exists.
      await AuthApi.resendChangeEmailVerification()
    }
    
    resendSuccess.value = "Verification email sent again. Please check your inbox."
  } catch (e: unknown) {
    resendError.value = e instanceof Error ? e.message : String(e)
  } finally {
    resendLoading.value = false
  }
}
</script>

<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="q-pa-lg shadow-2" style="max-width: 500px; width: 100%; border: 2px solid var(--q-primary)">
      <div class="text-h4 text-weight-bold text-primary q-mb-md">
        {{ currentContent.title }}
      </div>

      <p class="text-body1 q-mb-lg">
        {{ currentContent.desc }}
      </p>

      <div class="q-gutter-y-md">
        <q-input
          v-model="email"
          type="email"
          label="Email address"
          outlined
          dense
          :disable="flowType === 'change'"
        />

        <div class="row q-gutter-x-sm">
          <q-btn
            color="primary"
            class="col"
            :loading="resendLoading"
            :disable="!canResend"
            label="Resend Email"
            @click="handleResend"
          />
          <q-btn
            flat
            color="grey"
            label="Back to Login"
            to="/auth"
          />
        </div>

        <p v-if="resendSuccess" class="text-positive text-weight-bold q-mt-sm">
          {{ resendSuccess }}
        </p>

        <p v-if="resendError" class="text-negative text-weight-bold q-mt-sm">
          {{ resendError }}
        </p>
      </div>
    </q-card>
  </q-page>
</template>
