<script setup lang="ts">
import {onMounted} from "vue";
import {AuthApi} from "src/api/apis/auth_api";
import {AuthStore} from "stores/auth_store";
import {ThemeStore} from "stores/theme_store";

onMounted(async () => {
  ThemeStore.init();
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
  <div v-if="AuthStore.isBootstrapping" class="flex flex-center" style="height: 100vh;">
    <q-spinner-dots color="primary" size="40px" />
  </div>
  <router-view v-else />
</template>
