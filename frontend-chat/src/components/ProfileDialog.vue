<script setup lang="ts">
import { AuthStore } from "stores/auth_store"
import { computed, ref } from "vue"
import { useQuasar } from "quasar"
import { UserApi } from "src/api/apis/user_api"

import LogoutComponent from "components/LogoutComponent.vue"
import ChangePasswordForm from "components/ChangePasswordForm.vue"
import ChangeUsernameForm from "components/ChangeUsernameForm.vue"
import ChangeEmailForm from "components/ChangeEmailForm.vue"
import DeactivateAccountButton from "components/DeactivateAccountButton.vue"
import AvatarUpload from "components/AvatarUpload.vue"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(["update:modelValue"])

const $q = useQuasar()
const isAvatarLoading = ref(false)
const tab = ref("info")

const model = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
})

function close() {
  emit("update:modelValue", false)
}

async function handleAvatarUpload(file: File) {
  isAvatarLoading.value = true
  try {
    const res = await UserApi.setUserAvatar(file)
    AuthStore.setAvatarId(res.avatarId)
    $q.notify({
      type: "positive",
      message: "Avatar updated successfully",
      position: "top"
    })
  } catch (e) {
    $q.notify({
      type: "negative",
      message: e instanceof Error ? e.message : "Failed to upload avatar",
      position: "top"
    })
  } finally {
    isAvatarLoading.value = false
  }
}

async function handleAvatarDelete() {
  isAvatarLoading.value = true
  try {
    await UserApi.deleteUserAvatar()
    AuthStore.setAvatarId(null)
    $q.notify({
      type: "positive",
      message: "Avatar removed successfully",
      position: "top"
    })
  } catch (e) {
    $q.notify({
      type: "negative",
      message: e instanceof Error ? e.message : "Failed to delete avatar",
      position: "top"
    })
  } finally {
    isAvatarLoading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<template>
  <q-dialog v-model="model" transition-show="scale" transition-hide="scale">

    <q-card class="column no-wrap profile-card shadow-10">
      
      <!-- CLOSE BUTTON -->
      <div class="row justify-end q-pa-sm absolute-top-right z-top">
        <q-btn flat round dense icon="close" color="grey-7" @click="close" />
      </div>

      <!-- HEADER WITH AVATAR -->
      <q-card-section class="text-center q-pt-xl header-section">
        <div class="avatar-container q-mx-auto">
          <AvatarUpload
            :avatar-id="AuthStore.user?.avatarId"
            :name="AuthStore.user?.username"
            :loading="isAvatarLoading"
            can-delete
            @upload="handleAvatarUpload"
            @delete="handleAvatarDelete"
          />
        </div>

        <div class="text-h5 text-weight-bold q-mt-md text-primary">
          {{ AuthStore.user?.username }}
        </div>

        <div class="text-subtitle1 text-grey-8 row items-center justify-center q-gutter-x-xs">
          <q-icon name="email" size="18px" />
          <span>{{ AuthStore.user?.email }}</span>
        </div>
        
        <div class="q-mt-sm">
          <q-chip 
            :color="AuthStore.user?.isVerified ? 'positive' : 'warning'" 
            text-color="white" 
            dense 
            size="sm"
            :icon="AuthStore.user?.isVerified ? 'verified' : 'warning'"
          >
            {{ AuthStore.user?.isVerified ? 'Verified' : 'Unverified' }}
          </q-chip>
        </div>
      </q-card-section>

      <!-- TABS NAVIGATION -->
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="info" icon="person" label="Info" />
        <q-tab name="settings" icon="settings" label="Settings" />
        <q-tab name="security" icon="lock" label="Security" />
      </q-tabs>

      <q-separator />

      <!-- TAB PANELS (SCROLLABLE CONTENT) -->
      <q-card-section class="col scroll q-pa-none">
        <q-tab-panels v-model="tab" animated class="transparent">
          
          <!-- INFO TAB -->
          <q-tab-panel name="info" class="q-pa-md">
            <q-list padding class="info-list">
              <q-item>
                <q-item-section avatar>
                  <q-icon color="primary" name="fingerprint" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>User ID</q-item-label>
                  <q-item-label class="text-mono">{{ AuthStore.user?.id }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon color="primary" name="visibility" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Last seen</q-item-label>
                  <q-item-label v-if="AuthStore.user">{{ formatDate(AuthStore.user.lastSeenAt) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon color="primary" name="calendar_today" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Member since</q-item-label>
                  <q-item-label v-if="AuthStore.user">{{ formatDate(AuthStore.user.createdAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            
            <div class="q-mt-lg flex flex-center">
              <LogoutComponent class="full-width" />
            </div>
          </q-tab-panel>

          <!-- SETTINGS TAB -->
          <q-tab-panel name="settings" class="q-pa-md q-gutter-y-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm uppercase tracking-wider">Account Settings</div>
            <ChangeUsernameForm />
            <ChangeEmailForm />
            
            <q-separator class="q-my-md" />
            
            <div class="text-subtitle2 text-negative q-mb-sm uppercase tracking-wider">Danger Zone</div>
            <DeactivateAccountButton class="full-width" />
          </q-tab-panel>

          <!-- SECURITY TAB -->
          <q-tab-panel name="security" class="q-pa-md">
            <div class="text-subtitle2 text-grey-7 q-mb-md uppercase tracking-wider">Security Configuration</div>
            <ChangePasswordForm />
          </q-tab-panel>

        </q-tab-panels>
      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<style scoped>
.profile-card {
  width: 450px;
  max-width: 95vw;
  height: 85vh;
  max-height: 700px;
  border-radius: 16px;
  overflow: hidden;
}

.header-section {
  background: #f5f5f5;
}

.body--dark .header-section {
  background: #2a2a2a !important;
}

.avatar-container {
  width: fit-content;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.body--dark .avatar-container {
  border-color: #333 !important;
}

.info-list .q-item {
  border-radius: 8px;
  transition: background 0.2s;
}

.info-list .q-item:hover {
  background: rgba(0,0,0,0.03);
}

.text-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}
</style>
