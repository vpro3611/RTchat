<script setup lang="ts">
import { ref } from "vue"
import { AuthApi } from "src/api/apis/auth_api"
import { useRouter } from "vue-router"

const router = useRouter()

const email = ref("")
const newPassword = ref("")
const isLoading = ref(false)
const error = ref<string | null>(null)

const emit = defineEmits(['back'])

async function handleRestore() {
  if (isLoading.value) return
  error.value = null

  try {
    isLoading.value = true
    await AuthApi.restoreForgottenPassword(email.value, newPassword.value)
    
    // Redirect to generic notice page
    await router.push({
      path: "/verify-email",
      query: { 
        email: email.value,
        type: "reset-pass"
      }
    })
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="q-gutter-y-md">
    <div class="text-h5 text-weight-bold text-primary">Restore Password</div>
    <div class="text-caption">Enter your email and a new password. We will send a confirmation link.</div>

    <q-form @submit="handleRestore" class="q-gutter-y-sm">
      <q-input
        v-model="email"
        label="Email"
        type="email"
        outlined
        required
        :rules="[val => !!val || 'Email is required']"
      />

      <q-input
        v-model="newPassword"
        label="New Password"
        type="password"
        outlined
        required
        :rules="[val => !!val || 'New password is required', val => val.length >= 12 || 'Min 12 characters']"
      />

      <div v-if="error" class="text-negative text-caption q-pa-xs">
        {{ error }}
      </div>

      <div class="row q-gutter-x-sm">
        <q-btn
          label="Send Link"
          type="submit"
          color="primary"
          class="col"
          :loading="isLoading"
        />
        <q-btn
          label="Back"
          flat
          color="grey"
          @click="emit('back')"
          :disable="isLoading"
        />
      </div>
    </q-form>
  </div>
</template>
