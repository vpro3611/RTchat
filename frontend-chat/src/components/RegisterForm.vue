<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  submit: [{
    username: string
    email: string
    password: string
  }]
}>()

const username = ref("")
const email = ref("")
const password = ref("")

function handleSubmit() {
  emit("submit", {
    username: username.value,
    email: email.value,
    password: password.value
  })
}
</script>

<template>
  <div class="q-pa-sm">
    <div class="text-h5 text-weight-bold text-primary q-mb-lg">Create Account</div>

    <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
      
      <div>
        <div class="text-subtitle2 text-weight-bold q-mb-xs">Username</div>
        <q-input
          v-model="username"
          placeholder="Choose a unique username"
          outlined
          dense
          required
        />
      </div>

      <div>
        <div class="text-subtitle2 text-weight-bold q-mb-xs">Email</div>
        <q-input
          v-model="email"
          type="email"
          placeholder="name@example.com"
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
          placeholder="Minimum 12 characters"
          outlined
          dense
          required
          :rules="[val => val.length >= 12 || 'Minimum 12 characters']"
        />
      </div>

      <div class="q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          unelevated
          class="full-width text-weight-bold"
          size="16px"
          :loading="props.isLoading"
          label="Sign Up"
        />
      </div>

      <div v-if="props.error" class="text-negative text-weight-bold q-mt-sm text-center">
        {{ props.error }}
      </div>

    </q-form>
  </div>
</template>
