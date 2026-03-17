<script setup lang="ts">
import { ref } from "vue"
import { useQuasar } from "quasar"

import { ChatStore } from "stores/chat_store"
import {UserApi} from "src/api/apis/user_api";

const $q = useQuasar()

const isLoading = ref(false)

function openDialog(chatId: string, currentTitle: string) {
  $q.dialog({
    title: "Edit group title",
    prompt: {
      model: currentTitle,
      type: "text",
      label: "New title"
    },
    cancel: true,
    persistent: true
  }).onOk((val: string) => {
    void updateTitle(chatId, val)
  })
}

async function updateTitle(chatId: string, newTitle: string) {
  if (isLoading.value) return

  const trimmed = newTitle.trim()
  if (!trimmed) return

  try {
    isLoading.value = true

    const updated = await UserApi.updateGroupConversationTitle(
      trimmed,
      chatId
    );

    ChatStore.updateChat(updated)

    $q.notify({
      type: "positive",
      message: "Title updated"
    })

  } catch (e) {
    console.error(e)

    $q.notify({
      type: "negative",
      message: "Failed to update title"
    })

  } finally {
    isLoading.value = false
  }
}

defineExpose({ openDialog })
</script>
