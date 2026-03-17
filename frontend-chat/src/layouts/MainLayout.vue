<script setup lang="ts">
import { onMounted, ref } from "vue"
import {useRoute} from "vue-router"
import { useQuasar } from "quasar"
import { ChatStore } from "stores/chat_store"
import { UserApi } from "src/api/apis/user_api"

import ChatList from "components/ChatList.vue"
import ChatPage from "pages/ChatPage.vue"
import CreateGroupDialog from "components/CreateGroupDialog.vue"
import ProfileDialog from "components/ProfileDialog.vue"

const showProfileDialog = ref(false);


const drawer = ref(true)

const route = useRoute()
const $q = useQuasar()
const error = ref<string | null>(null)


const createDialogRef = ref<InstanceType<typeof CreateGroupDialog> | null>(null)

function openCreateGroupDialog() {
  createDialogRef.value?.openDialog();
}

async function loadChats() {
  if (ChatStore.isLoading) return

  ChatStore.isLoading = true

  try {
    const res = await UserApi.getUserConversations({
      limit: 20
    })

    ChatStore.setChats(res.items, res.nextCursor)
  } catch (e) {
    console.error(e)
    error.value = e instanceof Error ? e.message : String(e)

    $q.notify({
      type: "negative",
      message: "Failed to load chats"
    })
  } finally {
    ChatStore.isLoading = false
    ChatStore.finishBootstrapping()
  }
}

onMounted(loadChats)
</script>

<template>

  <q-layout view="hHh Lpr fFf">

    <!-- HEADER -->
    <q-header elevated>
      <q-toolbar>

        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="drawer = !drawer"
        />

        <q-toolbar-title>
          Chat
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          dense
          round
          icon="person"
          @click="showProfileDialog = true"
        />

        <q-btn
          flat
          dense
          round
          icon="add"
          @click="openCreateGroupDialog"
        />

      </q-toolbar>
    </q-header>

    <!-- LEFT: CHAT LIST -->
    <q-drawer
      v-model="drawer"
      side="left"
      bordered
      show-if-above
      :width="320"
    >
      <ChatList />
    </q-drawer>

    <!-- RIGHT: CHAT CONTENT -->
    <q-page-container>

      <div v-if="!route.params.id" class="flex flex-center full-height">
        <div class="text-grey">
          Select a chat to start messaging
        </div>
      </div>

      <ChatPage v-else />

    </q-page-container>

  </q-layout>

  <CreateGroupDialog ref="createDialogRef" />
  <ProfileDialog v-model="showProfileDialog" />
</template>
