<script setup lang="ts">
import { ref } from "vue"
import { useQuasar } from "quasar"
import { useRouter } from "vue-router"

import {UserApi} from "src/api/apis/user_api";
import {ChatStore} from "stores/chat_store";

const $q = useQuasar()
const router = useRouter()
const error = ref<string | null>(null)
//const title = ref("")
const isLoading = ref(false)

function openDialog() {
  $q.dialog({
    title: "Create group chat",
    prompt: {
      model: "",
      type: "text",
      label: "Group title"
    },
    cancel: true,
    persistent: true
  }).onOk((val: string) => {
    void createGroup(val)
  })
}

async function createGroup(value: string) {
  if (isLoading.value) return
  error.value = null
  const trimmed = value.trim()
  if (!trimmed) return

  try {
    isLoading.value = true

    const response = await UserApi.createGroupConversation(trimmed)

    ChatStore.addChat(response);

    await router.push(`/chat/${response.id}`)

  } catch (e) {
    console.error(e)
    error.value = e instanceof Error ? e.message : String(e)
    $q.notify({
      type: "negative",
      message: `Failed to create group. Reason: ${error.value}`
    })

  } finally {
    isLoading.value = false
  }
}

defineExpose({ openDialog })
</script>
