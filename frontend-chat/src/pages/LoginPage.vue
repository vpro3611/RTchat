<script setup lang="ts">
import LoginForm from "src/components/LoginForm.vue"
import {useRouter} from "vue-router";
import {ref} from "vue";
import {AuthApi} from "src/api/apis/auth_api";
import {AuthStore} from "stores/auth_store";

const router = useRouter();
const emit = defineEmits(['forgotPassword', 'restoreAccount'])

const error = ref<string | null>(null);
const isLoading = ref(false);

const registrationToken = ref<string | null>(null);
const requiresRegistration = ref(false);
const googleUsername = ref("");
const googlePassword = ref("");

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

async function handleGoogleLoginAction(credential: string) {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    error.value = null;

    const response = await AuthApi.loginByGoogle(credential);

    if (response.requiresRegistration) {
      requiresRegistration.value = true;
      registrationToken.value = response.registrationToken;
    } else {
      AuthStore.setToken(response.accessToken, response.user);
      await router.push("/main");
    }
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    isLoading.value = false;
  }
}

async function submitGoogleRegistration() {
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    error.value = null;

    const response = await AuthApi.registerByGoogle(googleUsername.value, googlePassword.value, registrationToken.value!);
    AuthStore.setToken(response.accessToken, response.user);
    await router.push("/main");
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div v-if="!requiresRegistration">
    <LoginForm
      :isLoading="isLoading"
      :error="error"
      @submit="handleLogin"
      @googleLogin="handleGoogleLoginAction"
      @forgotPassword="emit('forgotPassword')"
      @restoreAccount="emit('restoreAccount')"
    />
  </div>
  
  <div v-else class="q-pa-md">
    <div class="text-h5 text-weight-bold text-primary q-mb-lg">Complete Registration</div>
    <div class="q-mb-md">We verified your Google account. Please choose a username and a password.</div>

    <q-form @submit.prevent="submitGoogleRegistration" class="q-gutter-y-md">
      <div>
        <div class="text-subtitle2 text-weight-bold q-mb-xs">Username</div>
        <q-input v-model="googleUsername" outlined dense required />
      </div>

      <div>
        <div class="text-subtitle2 text-weight-bold q-mb-xs">Password</div>
        <q-input v-model="googlePassword" type="password" outlined dense required />
      </div>

      <div class="row items-center justify-between q-mt-md">
        <q-btn type="submit" color="primary" unelevated :loading="isLoading" label="Complete Registration" />
        <q-btn flat color="grey" label="Cancel" @click="requiresRegistration = false" />
      </div>

      <div v-if="error" class="text-negative text-weight-bold q-mt-sm">
        {{ error }}
      </div>
    </q-form>
  </div>
</template>
