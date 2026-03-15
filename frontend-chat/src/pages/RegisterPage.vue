<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import RegisterForm from "src/components/RegisterForm.vue"
import { AuthApi } from "src/api/apis/auth_api"

const router = useRouter()

const error = ref<string | null>(null)
const isLoading = ref(false)

async function handleRegister(data: {
  username: string
  email: string
  password: string
}) {
  if (isLoading.value) return

  try {
    isLoading.value = true
    error.value = null

    const response = await AuthApi.register(
      data.username,
      data.email,
      data.password
    )

    console.log(
      `registered ${response.username} ${response.email}`
    )

    await router.push("/verify-email")

  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <RegisterForm
    :isLoading="isLoading"
    :error="error"
    @submit="handleRegister"
  />

  <p v-if="error" class="modern-form__error">Error: {{error}}</p>
</template>
