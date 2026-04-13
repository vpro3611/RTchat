<script setup lang="ts">
import LoginForm from "src/components/LoginForm.vue"
import {useRouter} from "vue-router";
import {ref} from "vue";
import {AuthApi} from "src/api/apis/auth_api";
import {AuthStore} from "stores/auth_store";
import type {User} from "src/api/types/register_response";

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
      registrationToken.value = response.registrationToken as string;
    } else {
      AuthStore.setToken(response.accessToken as string, response.user as User);
      await router.push("/main");
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
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
    AuthStore.setToken(response.accessToken as string, response.user as User);
    await router.push("/main");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-center">
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
      mode="out-in"
    >
      <div v-if="!requiresRegistration" key="login" class="full-width">
        <LoginForm
          :isLoading="isLoading"
          :error="error"
          @submit="handleLogin"
          @googleLogin="handleGoogleLoginAction"
          @forgotPassword="emit('forgotPassword')"
          @restoreAccount="emit('restoreAccount')"
        />
      </div>
      
      <div v-else key="google-register" class="q-pa-lg rounded-borders shadow-2 full-width">
        <div class="column items-center q-mb-lg">
          <q-avatar size="72px" font-size="42px" color="primary" text-color="white" icon="account_circle" class="q-mb-md" />
          <div class="text-h5 text-weight-bold text-primary">Complete Profile</div>
          <div class="row items-center q-mt-sm bg-green-1 q-pa-xs q-px-md rounded-borders border-green-2 border-1">
            <q-icon name="check_circle" color="positive" size="16px" class="q-mr-sm" />
            <div class="text-caption text-positive text-weight-medium">Email verified by Google</div>
          </div>
        </div>

        <div class="text-body2 text-grey-8 q-mb-xl text-center">
          Almost there! Just choose a unique username and a secure password to finish setting up your RTchat account.
        </div>

        <q-form @submit.prevent="submitGoogleRegistration" class="q-gutter-y-lg">
          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-xs">Username</div>
            <q-input 
              v-model="googleUsername" 
              outlined 
              dense 
              placeholder="Pick a unique username"
              lazy-rules
              :rules="[val => val && val.length >= 3 || 'Min 3 characters']"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-xs">Password</div>
            <q-input 
              v-model="googlePassword" 
              type="password" 
              outlined 
              dense 
              placeholder="Create a strong password"
              lazy-rules
              :rules="[val => val && val.length >= 8 || 'Min 8 characters']"
            />
          </div>

          <div class="column q-gutter-y-sm q-mt-xl">
            <q-btn 
              type="submit" 
              color="primary" 
              unelevated 
              class="full-width text-weight-bold" 
              size="lg"
              :loading="isLoading" 
              label="Complete Registration" 
            />
            <q-btn 
              flat 
              color="grey-7" 
              class="full-width" 
              label="Back to Sign In" 
              @click="requiresRegistration = false" 
              :disable="isLoading"
            />
          </div>

          <div v-if="error" class="text-negative text-weight-bold q-mt-lg text-center bg-red-1 q-pa-sm rounded-borders">
            {{ error }}
          </div>
        </q-form>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.animated {
  animation-duration: 0.3s;
}

.border-1 {
  border: 1px solid transparent;
}

.border-green-2 {
  border-color: #c8e6c9;
}
</style>
