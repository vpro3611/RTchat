<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
  mode: "email" | "username"
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  submit: [{ identifier: string; password: string }]
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
  <q-card class="q-pa-lg" style="max-width: 420px; margin:auto">

    <q-card-section>
      <div class="text-h6">
        Login by your {{ props.mode }}
      </div>
    </q-card-section>

    <q-form @submit.prevent="handleSubmit" class="q-gutter-md">

      <q-input
        v-model="identifier"
        :type="props.mode === 'email' ? 'email' : 'text'"
        :label="props.mode === 'email' ? 'Email' : 'Username'"
        outlined
        dense
      />

      <q-input
        v-model="password"
        type="password"
        label="Password"
        outlined
        dense
      />

      <q-btn
        type="submit"
        color="primary"
        :loading="props.isLoading"
        label="Login"
      />

      <div v-if="props.error" class="text-negative">
        {{ props.error }}
      </div>

    </q-form>

  </q-card>
</template>
