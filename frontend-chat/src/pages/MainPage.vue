<script setup lang="ts">
import {AuthStore} from "stores/auth_store";
import {ref} from "vue";
import CreateGroupDialog from "components/CreateGroupDialog.vue";
const dialogRef = ref();
</script>

<template>

  <q-page class="q-pa-md">

    Main page

    <h1>Hello, {{AuthStore.user?.username}}</h1>
    <p>Under construction</p>

    <q-btn
      icon="group_add"
      label="New group"
      @click="dialogRef.openDialog()"
    />


    <CreateGroupDialog ref="dialogRef" />

  </q-page>

</template>
