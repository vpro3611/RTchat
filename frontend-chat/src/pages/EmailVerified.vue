<script setup lang="ts">
import { useRoute } from "vue-router"
import { computed } from "vue"

type StatusType = "success" | "error"
type PageType = "register" | "change"

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
  return queryType === "change" ? "change" : "register"
})

const map: PageMap = {
  register: {
    success: {
      title: "Email verified successfully",
      message: "Your account has been verified. You can now login."
    },
    error: {
      title: "Verification link is invalid or expired",
      message: "Please request a new verification email."
    }
  },
  change: {
    success: {
      title: "Email updated successfully",
      message: "Your new email has been confirmed."
    },
    error: {
      title: "Invalid or expired link",
      message: "Please try changing your email again."
    }
  }
}

const content = computed(() => {
  return map[flow.value][status.value] || {
    title: "Unknown status",
    message: ""
  }
})

// const isRegister = computed(() => flow === "register")

const buttonText = computed(() => flow.value === "register" ? "Go to login" : "Go to main");
const redirectTo = computed(() => flow.value === "register" ? "/auth" : "/main");

</script>

<template>
  <section class="container">

    <h2>
      {{ content.title }}
    </h2>

    <p>
      {{ content.message }}
    </p>

    <button @click="$router.push(redirectTo)">
      {{ buttonText }}
    </button>

  </section>
</template>
