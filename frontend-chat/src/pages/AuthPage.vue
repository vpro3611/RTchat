<script setup lang="ts">
import { ref } from "vue"
import LoginPage from "pages/LoginPage.vue"
import RegisterPage from "pages/RegisterPage.vue"
import ForgotPasswordForm from "components/ForgotPasswordForm.vue"
import RestoreAccountForm from "components/RestoreAccountForm.vue"
import ThemeSwitcher from "components/ThemeSwitcher.vue"

const showForgotPassword = ref(false)
const showRestoreAccount = ref(false)
const tab = ref('login')
</script>

<template>
  <q-page class="q-pa-md flex flex-center">
    <div class="fixed-top-right q-pa-md">
      <ThemeSwitcher />
    </div>

    <q-card
      class="q-pa-none shadow-3"
      style="max-width: 480px; width:100%; border: 2px solid var(--q-primary); border-radius: 12px; overflow: hidden;"
    >
      
      <!-- Normal Login/Register Tabs -->
      <div v-if="!showForgotPassword && !showRestoreAccount">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="login" label="Sign In" class="text-weight-bold" />
          <q-tab name="register" label="Sign Up" class="text-weight-bold" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="login" class="q-pa-lg">
            <LoginPage 
              @forgotPassword="showForgotPassword = true" 
              @restoreAccount="showRestoreAccount = true"
            />
          </q-tab-panel>

          <q-tab-panel name="register" class="q-pa-lg">
            <RegisterPage />
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- Forgot Password View -->
      <div v-else-if="showForgotPassword" class="q-pa-lg">
        <ForgotPasswordForm @back="showForgotPassword = false" />
      </div>

      <!-- Restore Account View -->
      <div v-else class="q-pa-lg">
        <RestoreAccountForm @back="showRestoreAccount = false" />
      </div>

    </q-card>

  </q-page>
</template>
