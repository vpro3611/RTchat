<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { AuthStore } from "stores/auth_store"

const router = useRouter()

const isLoading = ref(false)
const error = ref<string | null>(null)

async function handleLogout() {
  if (isLoading.value) return

  try {
    isLoading.value = true
    error.value = null

    AuthStore.clearToken()

    await router.replace("/auth")

  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>

  <q-btn
    color="negative"
    icon="logout"
    label="Logout"
    :loading="isLoading"
    @click="handleLogout"
  />

  <div v-if="error" class="text-negative q-mt-sm">
    {{ error }}
  </div>

</template>
