<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  submit: [{ identifier: string; password: string }],
  forgotPassword: [],
  restoreAccount: []
}>()

const identifier = ref("")
const password = ref("")

function handleSubmit() {
  emit("submit", {
    identifier: identifier.value,
    password: password.value
  })
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

      <div class="row items-center justify-between q-mt-md">
        <q-btn
          type="submit"
          color="primary"
          unelevated
          class="text-weight-bold q-px-xl"
          :loading="props.isLoading"
          label="Login"
        />
        <div class="column items-end">
          <q-btn
            flat
            dense
            color="grey-8"
            class="text-weight-bold text-caption"
            label="Forgot password?"
            @click="emit('forgotPassword')"
            :disable="props.isLoading"
          />
          <q-btn
            flat
            dense
            color="primary"
            class="text-weight-bold text-caption"
            label="Restore account?"
            @click="emit('restoreAccount')"
            :disable="props.isLoading"
          />
        </div>
      </div>

      <div class="q-mt-lg flex flex-center">
        <GoogleLogin :callback="handleGoogleLogin" />
      </div>

      <div v-if="props.error" class="text-negative text-weight-bold q-mt-sm">
        {{ props.error }}
      </div>
    </q-form>
  </div>
</template>
v>
</template>
