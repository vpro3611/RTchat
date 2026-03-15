<script setup lang="ts">
  import {useRouter} from "vue-router";
  import {ref} from "vue";
  import {AuthStore} from "../stores/auth_store";

  const router = useRouter();
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const handleLogout = async () => {
    if (isLoading.value) {
      return;
    }
    try {
      isLoading.value = true;
      error.value = null;
      AuthStore.clearToken();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      AuthStore.clearToken();
      await router.replace('/auth');
      isLoading.value = false;
    }
  }

</script>

<template>
  <button :disabled="isLoading" @click="handleLogout">
    {{isLoading ? 'Loging out...' : 'Logout'}}
  </button>

  <p v-if="error" class="modern-form__error">{{ error }}</p>
</template>

<style scoped>

</style>
