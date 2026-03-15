<script setup lang="ts">

import {ref} from "vue";
import {AuthApi} from "../api/apis/auth_api.ts";
import {useRouter} from "vue-router";
const email = ref('');
const password = ref('');
const username = ref('');
const error = ref<string | null>(null);
const isLoading = ref(false);
const router = useRouter();


const handleSubmit = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    error.value = null;

    const response = await AuthApi.register(username.value, email.value, password.value);
    console.log(`registered, now please, confirm your email, hello, ${response.username} | ${response.email}`);
    await router.push('/verify-email');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <form class="modern-form" @submit.prevent="handleSubmit">
    <h2 class="modern-form__title">Register</h2>

    <label class="modern-form__field">
      <span class="modern-form__label">Username</span>
      <input v-model="username" type="text" placeholder="your cool username" />
    </label>


    <label class="modern-form__field">
      <span class="modern-form__label">Email</span>
      <input v-model="email" type="email" placeholder="you@example.com" />
    </label>

    <label class="modern-form__field">
      <span class="modern-form__label">Password</span>
      <input v-model="password" type="password" placeholder="Minimum 10 characters" />
    </label>

    <button :disabled="isLoading">
      {{ isLoading ? 'Creating account…' : 'Register' }}
    </button>

    <p v-if="error" class="modern-form__error">{{ error }}</p>
  </form>
</template>
