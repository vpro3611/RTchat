<script setup lang="ts">
import LoginForm from "src/components/LoginForm.vue"
import {useRouter} from "vue-router";
import {ref} from "vue";
import {AuthApi} from "src/api/apis/auth_api";
import {AuthStore} from "stores/auth_store";

const router = useRouter();
const emit = defineEmits(['forgotPassword'])

const error = ref<string | null>(null);
const isLoading = ref(false);

async function handleLogin(data: { identifier: string; password: string }) {
  if (isLoading.value) return

  try {
    isLoading.value = true
    error.value = null

    // Smart routing based on whether the input looks like an email
    const isEmail = data.identifier.includes('@')
    
    let response;
    if (isEmail) {
      response = await AuthApi.loginByEmail(data.identifier, data.password);
      console.log("email login", response.user.email)
    } else {
      response = await AuthApi.loginByUsername(data.identifier, data.password);
      console.log("username login", response.user.username);
    }

    AuthStore.setToken(response.accessToken, response.user);

    await router.push("/main")
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <LoginForm
    :isLoading="isLoading"
    :error="error"
    @submit="handleLogin"
    @forgotPassword="emit('forgotPassword')"
  />
</template>
