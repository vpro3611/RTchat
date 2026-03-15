<script setup lang="ts">
import {onMounted} from "vue";
import {AuthApi} from "./api/apis/auth_api.ts";
import {AuthStore} from "./stores/auth_store.ts";

onMounted(async () => {
  try {
    const refreshData = await AuthApi.refresh();

    if (refreshData?.accessToken) {
      AuthStore.setToken(refreshData?.accessToken, null);
      const user = await AuthApi.me();
      if (!user) {
        AuthStore.clearToken();
        return;
      }
      AuthStore.setUser(user);
    }
  } catch (e) {
    AuthStore.clearToken();
    console.error(e);
  } finally {
    AuthStore.finishBootstrapping();
  }
})


</script>



<template>
  <router-view />
</template>
