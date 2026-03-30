<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useQuasar } from "quasar"

import { ChatStore } from "stores/chat_store"
import {UserApi} from "src/api/apis/user_api";

const props = defineProps<{
  chatId: string
}>()

const router = useRouter()
const $q = useQuasar()

const isLoading = ref(false)

function handleLeave() {
  $q.dialog({
    title: "Leave group",
    message: "Are you sure you want to leave this group?",
    cancel: true,
    persistent: true,
    ok: {
      label: "Leave",
      color: "negative"
    }
  }).onOk(() => {
    void leave()
  })
}

async function leave() {
  if (isLoading.value) return

  try {
    isLoading.value = true

    await UserApi.leaveGroupConversation(props.chatId)


    ChatStore.removeChat(props.chatId)


    if (router.currentRoute.value.params.id === props.chatId) {
      await router.replace("/main")
    }

    $q.notify({
      type: "positive",
      message: "You left the group"
    })

  } catch (e) {
    console.error(e)

    $q.notify({
      type: "negative",
      message: "Failed to leave group"
    })

  } finally {
    isLoading.value = false
  }
}
</script>

<template>

  <q-btn
    icon="logout"
    color="negative"
    flat
    label="Leave group"
    :loading="isLoading"
    @click="handleLeave"
  />

</template>
