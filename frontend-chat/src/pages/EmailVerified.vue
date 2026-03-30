<script setup lang="ts">
import { useRoute } from "vue-router"
import { computed } from "vue"

type StatusType = "success" | "error"
type PageType = "register" | "change" | "reset-pass" | "reset-activity"

type StatusContent = {
  title: string
  message: string
}

type StatusMap = Record<StatusType, StatusContent>
type PageMap = Record<PageType, StatusMap>

const route = useRoute()

const status = computed<StatusType>(() => {
  const queryStatus = route.query.status
  return queryStatus === "success" || queryStatus === "error" ? queryStatus : "error"
})

const flow = computed<PageType>(() => {
  const queryType = route.query.type
  if (queryType === "change") return "change"
  if (queryType === "reset-pass") return "reset-pass"
  if (queryType === "reset-activity") return "reset-activity"
  return "register"
})

const map: PageMap = {
  register: {
    success: {
      title: "Account Verified!",
      message: "Your account has been successfully verified. You can now join the conversation."
    },
    error: {
      title: "Verification Failed",
      message: "The verification link is invalid or has expired. Please request a new one."
    }
  },
  change: {
    success: {
      title: "Email Updated!",
      message: "Your new email address has been confirmed and updated."
    },
    error: {
      title: "Confirmation Failed",
      message: "We couldn't confirm your email change. The link might be expired."
    }
  },
  "reset-pass": {
    success: {
      title: "Password Reset!",
      message: "Your password has been successfully updated. You can now login with your new credentials."
    },
    error: {
      title: "Reset Failed",
      message: "This reset link is no longer valid. Please request a new password reset."
    }
  },
  "reset-activity": {
    success: {
      title: "Account Restored!",
      message: "Your account has been successfully reactivated. You can now log in."
    },
    error: {
      title: "Restoration Failed",
      message: "The reactivation link is invalid or has expired. Please request a new one."
    }
  }
}

const content = computed(() => {
  return map[flow.value][status.value] || {
    title: "Unknown status",
    message: ""
  }
})

const buttonText = computed(() => {
  if (status.value === "error") return "Back to Auth";
  return flow.value === "change" ? "Go to Main" : "Go to Login";
});

const redirectTo = computed(() => {
  if (status.value === "error") return "/auth";
  return (flow.value === "change") ? "/main" : "/auth";
});

</script>

<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="q-pa-xl shadow-2 text-center" style="max-width: 500px; width: 100%; border: 2px solid var(--q-primary)">
      <q-icon
        :name="status === 'success' ? 'check_circle' : 'error'"
        :color="status === 'success' ? 'positive' : 'negative'"
        size="80px"
        class="q-mb-md"
      />

      <div class="text-h4 text-weight-bold text-primary q-mb-md">
        {{ content.title }}
      </div>

      <p class="text-body1 q-mb-xl text-grey-8">
        {{ content.message }}
      </p>

      <q-btn
        color="primary"
        size="lg"
        class="full-width text-weight-bold"
        unelevated
        @click="$router.push(redirectTo)"
        :label="buttonText"
      />
    </q-card>
  </q-page>
</template>
