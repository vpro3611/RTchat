<script setup lang="ts">
import { ref } from "vue"
import {useRouter} from "vue-router";
import {AuthStore} from "stores/auth_store";
import {useQuasar} from "quasar";

const drawer = ref(false)

const router = useRouter();
const $q = useQuasar();


const handleLogout = () => {

  $q.dialog({
    title: "Logout",
    message: "Are you sure you want to logout?",
    cancel: true,
    persistent: true
  }).onOk(() => {

    AuthStore.clearToken()
    AuthStore.setUser(null)

    void router.replace("/auth")

  })
}

</script>

<template>

  <q-layout view="hHh Lpr fFf">

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

      </q-toolbar>
    </q-header>


    <q-drawer
      v-model="drawer"
      side="left"
      bordered
      overlay
      :width="300"
    >

      <q-list padding>

        <q-item clickable to="/main">
          <q-item-section avatar>
            <q-icon name="chat"/>
          </q-item-section>
          <q-item-section>Chats</q-item-section>
        </q-item>

        <q-item clickable to="/profile">
          <q-item-section avatar>
            <q-icon name="person"/>
          </q-item-section>
          <q-item-section>Profile</q-item-section>
        </q-item>

        <q-separator/>

        <q-item clickable @click="handleLogout" class="text-negative">
          <q-item-section avatar>
            <q-icon name="logout"/>
          </q-item-section>
          <q-item-section>
            Logout
          </q-item-section>
        </q-item>

      </q-list>

    </q-drawer>


    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>

</template>
