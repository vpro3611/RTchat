<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useQuasar } from "quasar"

import { AuthStore } from "stores/auth_store"
import {UserApi} from "src/api/apis/user_api";

const router = useRouter()
const $q = useQuasar()

const isLoading = ref(false)

async function deactivateAccount() {
  if (isLoading.value) return

  try {
    isLoading.value = true

    await UserApi.toggleStatus()

    AuthStore.clearToken()
    AuthStore.setUser(null)

    await router.replace("/auth")

  } catch (e) {
    console.error(e)

    $q.notify({
      type: "negative",
      message: "Failed to deactivate account"
    })

  } finally {
    isLoading.value = false
  }
}

function handleDeactivate() {

  $q.dialog({
    title: "Deactivate account",
    message: `
          Your account will be deactivated.

          Consequences:
          • You will be logged out
          • You will not be able to login again
          • All actions will be disabled

          You can only restore access through support.
          `,
    cancel: true,
    persistent: true,
    ok: {
      label: "Deactivate",
      color: "negative"
    }
  }).onOk(() => {
    void deactivateAccount();
  })
}
</script>

<template>

  <q-card flat bordered class="q-mt-md">

    <q-card-section class="text-h6 text-negative">
      Danger Zone
    </q-card-section>

    <q-card-section>

      <div class="q-mb-md">
        Deactivate your account. You will no longer be able to login.
      </div>

      <q-btn
        color="negative"
        label="Deactivate account"
        :loading="isLoading"
        @click="handleDeactivate"
      />

    </q-card-section>

  </q-card>

</template>
