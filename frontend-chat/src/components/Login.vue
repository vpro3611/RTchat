<script setup lang="ts">
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import {AuthApi} from "../api/apis/auth_api.ts";

  const email = ref("");
  const password = ref("");
  const username = ref("");
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const router = useRouter();

  const handleSubmitByEmail = async () => {
    if (isLoading.value) return;

    try {
      isLoading.value = true;
      error.value = null;

      const response = await AuthApi.loginByEmail(email.value, password.value);
      console.log(response.user.email);
      await router.push('/home');
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      isLoading.value = false;
    }
  }

  const handleSubmitByUsername = async () => {
    if (isLoading.value) return;

    try {
      isLoading.value = true;
      error.value = null;

      const response = await AuthApi.loginByUsername(username.value, password.value);
      console.log(response.user.username);
      await router.push('/home');
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <!-- by email -->

  <form class="modern-form" @submit.prevent="handleSubmitByEmail">
    <h2 class="modern-form__title">Login by your email</h2>

    <label class="modern-form__field">
      <span class="modern-form__label">Email</span>
      <input v-model="email" type="email" placeholder="you@example.com" />
    </label>

    <label class="modern-form__field">
      <span class="modern-form__label">Password</span>
      <input v-model="password" type="password" placeholder="••••••••••" />
    </label>

    <button :disabled="isLoading">
      {{ isLoading ? 'Logging in…' : 'Login' }}
    </button>


    <p v-if="error" class="modern-form__error">{{ error }}</p>
  </form>

  <!-- by username -->

  <form class="modern-form" @submit.prevent="handleSubmitByUsername">
    <h2 class="modern-form__title">Login by your username</h2>

    <label class="modern-form__field">
      <span class="modern-form__label">Username</span>
      <input v-model="username" type="text" placeholder="your cool username" />
    </label>

    <label class="modern-form__field">
      <span class="modern-form__label">Password</span>
      <input v-model="password" type="password" placeholder="••••••••••" />
    </label>

    <button :disabled="isLoading">
      {{ isLoading ? 'Logging in…' : 'Login' }}
    </button>

    <p v-if="error" class="modern-form__error">{{ error }}</p>
  </form>

</template>
<style scoped>

</style>