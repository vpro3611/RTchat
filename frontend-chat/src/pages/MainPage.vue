<script setup lang="ts">

import Logout from "../components/Logout.vue";
import {onMounted} from "vue";
import {AuthApi} from "../api/apis/auth_api.ts";
import {AuthStore} from "../stores/auth_store.ts";


onMounted(async () => {
  try {
    const user = await AuthApi.me();
    if (!user || !user.isVerified || !user.isActive) {
      AuthStore.clearToken();
      return;
    }
    AuthStore.setUser(user);
  } catch (e) {
    AuthStore.clearToken();
    console.error(e);
  } finally {
    AuthStore.finishBootstrapping();
  }
})

</script>

<template>
  <div>Hello, i am main page</div>
  <p>Logout</p>
  <Logout />
</template>

<style scoped>

</style>