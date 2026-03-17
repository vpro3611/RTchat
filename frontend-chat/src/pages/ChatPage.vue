<script setup lang="ts">
import { useRoute } from "vue-router"
import {computed, ref} from "vue";
import {ChatStore} from "stores/chat_store";
import EditGroupTitleDialog from "components/EditGroupTitleDialog.vue";
import LeaveGroupButton from "components/LeaveGroupButton.vue";


const message = ref("")
const route = useRoute()

const dialogRef = ref();

const chat = computed(() => {
  return ChatStore.findById(route.params.id as string);
})

function send() {
  if (!message.value.trim()) return

  console.log("Sending message:", message.value)

  message.value = ""
}

</script>

<template>
  <div class="column full-height">

    <!-- HEADER -->
    <div class="q-pa-md border-bottom">
      <div class="text-h6">
        Chat {{ route.params.id }}
      </div>
      <div class="text-subtitle2">
        Chat Title {{ chat?.title }}
      </div>
    </div>

    <q-btn
      v-if="chat?.conversationType === 'group'"
      icon="edit"
      flat
      round
      @click="dialogRef.openDialog(chat.id, chat.title)"
    />

    <EditGroupTitleDialog ref="dialogRef" />

    <LeaveGroupButton
      v-if="chat?.conversationType === 'group'"
      :chatId="chat.id"
    />

    <!-- MESSAGES -->
    <div class="col q-pa-md">
      <div class="text-grey">
        Messages will be here
      </div>
    </div>

    <!-- INPUT -->
    <div class="q-pa-md">
      <q-input
        v-model="message"
        @keyup.enter="send"
        dense
        outlined
        placeholder="Type a message..."
      />
    </div>

  </div>
</template>
