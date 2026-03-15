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
  <q-card class="q-pa-lg" style="max-width: 420px; margin:auto">

    <q-card-section>
      <div class="text-h6">
        Register
      </div>
    </q-card-section>

    <q-form @submit.prevent="handleSubmit" class="q-gutter-md">

      <q-input
        v-model="username"
        label="Username"
        outlined
        dense
      />

      <q-input
        v-model="email"
        label="Email"
        type="email"
        outlined
        dense
      />

      <q-input
        v-model="password"
        label="Password"
        type="password"
        outlined
        dense
      />

      <q-btn
        type="submit"
        color="primary"
        :loading="props.isLoading"
        label="Register"
      />

      <div v-if="props.error" class="text-negative">
        {{ props.error }}
      </div>

    </q-form>

  </q-card>
</template>
