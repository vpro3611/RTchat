<script setup lang="ts">
import {AuthStore} from "stores/auth_store";
</script>

<template>

  <q-page class="q-pa-md">

    Main page

    <h1>Hello, {{AuthStore.user?.username}}</h1>
    <p>Under construction</p>

  </q-page>

</template>
