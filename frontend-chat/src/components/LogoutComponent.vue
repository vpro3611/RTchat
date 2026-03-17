<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useQuasar } from "quasar"
import { AuthStore } from "stores/auth_store"
import {ChatStore} from "stores/chat_store";

const router = useRouter()
const $q = useQuasar()

const isLoading = ref(false)

function handleLogout() {
  if (isLoading.value) return

  $q.dialog({
    title: "Logout",
    message: "Are you sure you want to logout?",
    cancel: true,
    persistent: true
  })
    .onOk(() => {
      try {
        isLoading.value = true

        AuthStore.clearToken()
        AuthStore.setUser(null)

        ChatStore.clearChats();
        void router.replace("/auth")
      } finally {
        isLoading.value = false
      }
    })
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
</template>
