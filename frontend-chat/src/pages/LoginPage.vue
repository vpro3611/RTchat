<script setup lang="ts">
import LoginForm from "src/components/LoginForm.vue"
import {useRouter} from "vue-router";
import {ref} from "vue";
import {AuthApi} from "src/api/apis/auth_api";
import {AuthStore} from "stores/auth_store";

const router = useRouter();

const error = ref<string | null>(null);
const isLoading = ref(false);

async function loginByEmail(data: { identifier: string; password: string }) {
  if (isLoading.value) return

  try {
    isLoading.value = true
    error.value = null

    const response = await AuthApi.loginByEmail(
      data.identifier,
      data.password
    );


    AuthStore.setToken(response.accessToken, response.user);

    console.log("email login", response.user.email)

    await router.push("/main")
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

async function loginByUsername(data: { identifier: string; password: string }) {
  if (isLoading.value) return;

  try {
    isLoading.value = false;
    error.value = null;

    const response = await AuthApi.loginByUsername(
      data.identifier,
      data.password
    );

    AuthStore.setToken(response.accessToken, response.user);

    console.log("username login", response.user.username);

    await router.push("/main");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}


</script>

<template>
  <LoginForm
    mode="email"
    :isLoading="false"
    :error="null"
    @submit="loginByEmail"
  />

  <LoginForm
    mode="username"
    :isLoading="false"
    :error="null"
    @submit="loginByUsername"
  />

  <p v-if="error" class="modern-form__error">Error: {{error}}</p>
</template>
