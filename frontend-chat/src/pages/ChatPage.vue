<script setup lang="ts">
import { useRoute } from "vue-router"
import {ref} from "vue";
const message = ref("")
const route = useRoute()

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
    </div>

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
