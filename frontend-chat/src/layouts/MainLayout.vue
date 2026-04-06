<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue"
import {AuthStore} from "stores/auth_store";
import { useQuasar } from "quasar"

import { ChatStore } from "stores/chat_store"
import { SearchStore } from "stores/conversations_search_store"
import { UserApi } from "src/api/apis/user_api"

import ChatList from "components/ChatList.vue"
import CreateGroupDialog from "components/CreateGroupDialog.vue"
import ProfileDialog from "components/ProfileDialog.vue"
import SearchConversationsComponent from "components/SearchConversationsComponent.vue"
import UserSearchDialog from "components/UserSearchDialog.vue";
import MyRequestsDialog from "components/MyRequestsDialog.vue";
import SavedMessagesDialog from "components/SavedMessagesDialog.vue";
import ThemeSwitcher from "components/ThemeSwitcher.vue";

const showProfileDialog = ref(false)
const drawer = ref(true)


const $q = useQuasar()
const error = ref<string | null>(null)

const showUserSearch = ref(false)


const createDialogRef = ref<InstanceType<typeof CreateGroupDialog> | null>(null)
const myRequestsDialogRef = ref<InstanceType<typeof MyRequestsDialog> | null>(null)
const savedMessagesDialogRef = ref<InstanceType<typeof SavedMessagesDialog> | null>(null)

function openCreateGroupDialog() {
  createDialogRef.value?.openDialog()
}

function openMyRequests() {
  myRequestsDialogRef.value?.open()
}

function openSavedMessages() {
  savedMessagesDialogRef.value?.open()
}

//  главный флаг
const isSearching = computed(() => SearchStore.query.length > 1)

async function loadChats() {
  if (ChatStore.isLoading) return

  ChatStore.isLoading = true

  try {
    const res = await UserApi.getUserConversations({ limit: 20 })
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

onMounted(() => {
  if (!AuthStore.isBootstrapping) {
    void loadChats()
  }
})

watch(() => AuthStore.isBootstrapping, (isBootstrapping) => {
  if (!isBootstrapping) {
    void loadChats()
  }
})
</script>

<template>
  <q-layout view="hHh Lpr fFf">

    <!-- HEADER -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title>
          Chat
        </q-toolbar-title>

        <q-space />
        <q-btn flat dense round icon="bookmarks" @click="openSavedMessages">
          <q-tooltip>Saved Messages</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="search" @click="showUserSearch = true" />
        <q-btn flat dense round icon="group_add" @click="openMyRequests">
          <q-tooltip>My Join Requests</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="block" @click="$router.push('/blacklist')">
          <q-tooltip>Blocked users</q-tooltip>
        </q-btn>
        <ThemeSwitcher />
        <q-btn flat dense round icon="person" @click="showProfileDialog = true" />
        <q-btn flat dense round icon="add" @click="openCreateGroupDialog" />
      </q-toolbar>
    </q-header>

    <!-- LEFT -->
    <q-drawer v-model="drawer" side="left" bordered show-if-above :width="320">

      <div class="q-pa-sm">
        <SearchConversationsComponent />
      </div>

      <q-separator />

      <!-- ВОТ ТУТ МАГИЯ -->
      <ChatList v-if="!isSearching" />

    </q-drawer>

    <!-- RIGHT -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>

  <CreateGroupDialog ref="createDialogRef" />
  <UserSearchDialog v-model="showUserSearch" />
  <ProfileDialog v-model="showProfileDialog" />
  <MyRequestsDialog ref="myRequestsDialogRef" />
  <SavedMessagesDialog ref="savedMessagesDialogRef" />
</template>
