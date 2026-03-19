<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useQuasar } from "quasar"

import { UserApi } from "src/api/apis/user_api"
import {ChatStore} from "stores/chat_store";
import {AuthStore} from "stores/auth_store";

const props = defineProps<{
  userId: string
}>()

const router = useRouter()
const $q = useQuasar()

const isLoading = ref(false)

async function createChat() {
  try {
    isLoading.value = true

    console.log("createChat", props.userId)

    const res = await UserApi.createDirectConversation(props.userId)

    //  предполагаем, что сервер возвращает chatId
    const chatId = res.id

    ChatStore.addChat(res);

    // переход в чат
    await router.push(`/chat/${chatId}`)

  } catch (e) {
    console.error(e)

    $q.notify({
      type: "negative",
      message: "Failed to create chat"
    })

  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <q-btn
    label="Message"
    color="primary"
    :loading="isLoading"
    :disable="AuthStore.user?.id === userId"
    @click="createChat"
    class="full-width"
  />
</template>
