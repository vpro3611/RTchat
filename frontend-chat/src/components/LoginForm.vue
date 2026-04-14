<script setup lang="ts">
import { ref, computed } from "vue"
import { Dark } from 'quasar'

const props = defineProps<{
  isLoading: boolean
  error: string | null
}>()

const isDark = computed(() => Dark.isActive)

const emit = defineEmits<{
  submit: [{ identifier: string; password: string }],
  forgotPassword: [],
  restoreAccount: [],
  googleLogin: [credential: string]
}>()

const identifier = ref("")
const password = ref("")

function handleSubmit() {
  emit("submit", {
    identifier: identifier.value,
    password: password.value
  })
}

function handleGoogleLogin(response: { credential: string }) {
  emit('googleLogin', response.credential);
}
</script>

<template>
  <div class="q-pa-sm">
    <div class="text-h5 text-weight-bold text-primary q-mb-lg">Sign In</div>

    <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
      <div>
        <div class="text-subtitle2 text-weight-bold q-mb-xs">Email or Username</div>
        <q-input
          v-model="identifier"
          type="text"
          placeholder="Enter your email or username"
          outlined
          dense
          required
        />
      </div>

      <div>
        <div class="text-subtitle2 text-weight-bold q-mb-xs">Password</div>
        <q-input
          v-model="password"
          type="password"
          placeholder="Enter your password"
          outlined
          dense
          required
        />
      </div>

      <div class="row items-center justify-between q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          unelevated
          class="text-weight-bold q-px-xl full-width"
          :loading="props.isLoading"
          label="Sign In"
          size="lg"
        />
      </div>

      <div class="row items-center q-my-lg">
        <q-separator class="col" />
        <div class="text-caption text-grey-7 q-px-md text-weight-medium">OR</div>
        <q-separator class="col" />
      </div>

      <div class="flex flex-center">
        <GoogleLogin :callback="handleGoogleLogin" popup-type="TOKEN" :theme="isDark ? 'dark' : 'outline'" class="full-width google-btn-wrapper" />
      </div>

      <div class="column items-center q-mt-md">
        <q-btn
          flat
          dense
          :color="isDark ? 'grey-4' : 'grey-8'"
          class="text-weight-bold text-caption q-mb-xs"
          label="Forgot password?"
          @click="emit('forgotPassword')"
          :disable="props.isLoading"
        />
        <q-btn
          flat
          dense
          color="primary"
          class="text-weight-bold text-caption"
          label="Need to restore account?"
          @click="emit('restoreAccount')"
          :disable="props.isLoading"
        />
      </div>

      <div v-if="props.error" class="text-negative text-weight-bold q-mt-md text-center bg-red-1 q-pa-sm rounded-borders error-box">
        {{ props.error }}
      </div>
    </q-form>
  </div>
</template>

<style scoped>
.google-btn-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

:deep(.nsm7Bb-HzV7m-LgbsSe) {
  width: 100% !important;
  border-radius: 4px !important;
  justify-content: center !important;
}

.body--dark .error-box {
  background: rgba(255, 0, 0, 0.1) !important;
}
</style>
