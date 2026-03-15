<script setup lang="ts">

import LogoutPage from "pages/LogoutPage.vue";
import {onMounted} from "vue";
import {AuthApi} from "../api/apis/auth_api";
import {AuthStore} from "../stores/auth_store";


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
  <LogoutPage />
</template>

<style scoped>

</style>
