<script setup lang="ts">
import { AuthStore } from "stores/auth_store"
import { computed } from "vue"

import LogoutComponent from "components/LogoutComponent.vue"
import ChangePasswordForm from "components/ChangePasswordForm.vue"
import ChangeUsernameForm from "components/ChangeUsernameForm.vue"
import ChangeEmailForm from "components/ChangeEmailForm.vue"
import DeactivateAccountButton from "components/DeactivateAccountButton.vue"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(["update:modelValue"])

const model = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
})

function close() {
  emit("update:modelValue", false)
}
</script>

<template>
  <q-dialog v-model="model">

    <q-card class="column no-wrap" style="width: 400px; height: 90vh;">

      <!-- HEADER -->
      <q-card-section class="text-center">
        <q-avatar size="80px">
          <q-icon name="person" size="50px" />
        </q-avatar>

        <div class="text-h6 q-mt-md">
          {{ AuthStore.user?.username }}
        </div>

        <div class="text-caption text-grey">
          {{ AuthStore.user?.email }}
        </div>
      </q-card-section>

      <q-separator />

      <!-- SCROLL AREA -->
      <q-card-section class="col scroll" v-if="AuthStore.user">

        <div class="q-mb-md">
          <div><strong>ID:</strong> {{ AuthStore.user.id }}</div>
          <div><strong>Verified:</strong> {{ AuthStore.user.isVerified ? "Yes" : "No" }}</div>
          <div><strong>Active:</strong> {{ AuthStore.user.isActive ? "Yes" : "No" }}</div>
          <div><strong>Last seen:</strong> {{ new Date(AuthStore.user.lastSeenAt).toLocaleString() }}</div>
          <div><strong>Created:</strong> {{ new Date(AuthStore.user.createdAt).toLocaleString() }}</div>
          <div><strong>Updated:</strong> {{ new Date(AuthStore.user.updatedAt).toLocaleString() }}</div>
        </div>

        <q-separator class="q-my-md" />

        <LogoutComponent class="q-mb-md" />
        <ChangePasswordForm class="q-mb-md" />
        <ChangeUsernameForm class="q-mb-md" />
        <ChangeEmailForm class="q-mb-md" />
        <DeactivateAccountButton class="q-mb-md" />

      </q-card-section>

      <q-separator />

      <!-- FOOTER -->
      <q-card-actions align="right">
        <q-btn flat label="Close" @click="close" />
      </q-card-actions>

    </q-card>

  </q-dialog>
</template>
