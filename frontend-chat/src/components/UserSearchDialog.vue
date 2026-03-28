<script setup lang="ts">
import {ref, watch} from "vue"
import { debounce } from "lodash"

import { SearchStoreUser } from "stores/user_search_store"
import { UserApi } from "src/api/apis/user_api"
import { ParticipantApi } from "src/api/apis/participant_api"
import { ParticipantStore } from "stores/participant_store"
import { useQuasar } from "quasar"
import type { Participant } from "src/api/types/participant_response"
import UserProfileDialog from "components/UserProfileDialog.vue";
import AppAvatar from "components/AppAvatar.vue";

const props = defineProps<{
  modelValue: boolean,
  conversationId?: string
}>()
const emit = defineEmits(["update:modelValue", "added"])

const $q = useQuasar()
const isAdding = ref<Record<string, boolean>>({})

//  синхронизация диалога
watch(() => props.modelValue, (val) => {
  if (!val) {
    SearchStoreUser.clear()
  }
})

//  debounce поиск
watch(
  () => SearchStoreUser.query,
  debounce(async (val: string) => {
    if (!val || val.length < 2) {
      SearchStoreUser.clear()
      return
    }

    try {
      SearchStoreUser.setLoading(true)

      const res = await UserApi.searchUsers(val)

      SearchStoreUser.setResults(res.items, res.nextCursor ?? null)

    } finally {
      SearchStoreUser.setLoading(false)
    }
  }, 300)
)

//  pagination
async function loadMore(index: number, done: (stop?: boolean) => void) {
  if (!SearchStoreUser.query || SearchStoreUser.query.length < 2) {
    done(true)
    return
  }

  if (!SearchStoreUser.hasMore || SearchStoreUser.isLoading) {
    done(true)
    return
  }

  try {
    SearchStoreUser.setLoading(true)

    const res = await UserApi.searchUsers(
      SearchStoreUser.query,
      SearchStoreUser.nextCursor ?? undefined
    )

    SearchStoreUser.appendResults(res.items, res.nextCursor ?? null)

    done(!res.nextCursor)

  } catch (e) {
    console.error(e)
    done(true)
  } finally {
    SearchStoreUser.setLoading(false)
  }
}

const showProfile = ref(false);
const selectedUserId = ref<string | null>(null);

function openUserProfile(userId: string) {
  selectedUserId.value = userId;
  showProfile.value = true;
}

async function addToGroup(userId: string, username: string) {
  if (!props.conversationId) return

  try {
    isAdding.value[userId] = true
    const dto = await ParticipantApi.addParticipantToGroup(props.conversationId, userId)

    $q.notify({
      type: 'positive',
      message: `${username} added to group`
    })

    // Находим пользователя в результатах поиска, чтобы взять его email
    const user = SearchStoreUser.items.find(u => u.id === userId)

    // Формируем полный объект участника для Store
    const participant: Participant = {
      conversationId: dto.conversationId,
      userId: dto.userId,
      username: username,
      email: user?.email || '',
      avatarId: user?.avatarId || null,
      role: dto.role,
      canSendMessages: dto.canSendMessages,
      mutedUntil: dto.mutedUntil,
      joinedAt: dto.joinedAt
    }

    emit('added', participant)
  } catch {
    $q.notify({
      type: 'negative',
      message: `Failed to add ${username}`
    })
  } finally {
    isAdding.value[userId] = false
  }
}

function isAlreadyInGroup(userId: string) {
  if (!props.conversationId) return false
  return !!ParticipantStore.findById(userId)
}

</script>

<template>
  <q-dialog
    :model-value="props.modelValue"
    @update:model-value="val => emit('update:modelValue', val)"
    position="top"
  >
    <q-card style="width: 500px; max-width: 90vw;" class="vibrant-search-card">
      <q-card-section class="bg-primary text-white q-pa-lg">
        <div class="text-h5 text-weight-bolder" style="letter-spacing: -0.5px;">Find People</div>
        <div class="text-subtitle2 opacity-80">Search by username or email</div>
        
        <q-input
          v-model="SearchStoreUser.query"
          placeholder="Who are you looking for?"
          dark
          filled
          color="white"
          class="q-mt-md search-input-hero"
          autofocus
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append v-if="SearchStoreUser.query">
            <q-icon name="close" @click="SearchStoreUser.query = ''" class="cursor-pointer" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="q-pa-md bg-grey-1">
        <div style="height: 450px;">
          <q-infinite-scroll 
            @load="loadMore" 
            :offset="100" 
            class="full-height scroll"
            :disable="!SearchStoreUser.hasMore || SearchStoreUser.query.length < 2"
          >
            <div class="row q-col-gutter-md q-pb-lg">
              <div 
                v-for="user in SearchStoreUser.items" 
                :key="user.id" 
                class="col-12"
              >
                <q-card class="user-result-card shadow-1 transition-all">
                  <q-item class="q-pa-sm">
                    <q-item-section avatar>
                      <AppAvatar
                        :avatar-id="user.avatarId"
                        :name="user.username"
                        size="56px"
                        class="cursor-pointer hover-scale"
                        @click="openUserProfile(user.id)"
                      />
                    </q-item-section>

                    <q-item-section @click="openUserProfile(user.id)" class="cursor-pointer">
                      <q-item-label class="text-weight-bold text-h6">{{user.username}}</q-item-label>
                      <q-item-label caption lines="1">{{user.email}}</q-item-label>
                    </q-item-section>

                    <q-item-section side v-if="props.conversationId">
                      <q-btn
                        v-if="!isAlreadyInGroup(user.id)"
                        unelevated
                        color="primary"
                        icon="person_add"
                        label="Add"
                        :loading="isAdding[user.id]"
                        @click.stop="addToGroup(user.id, user.username)"
                        class="rounded-borders"
                      />
                      <q-badge v-else color="positive" class="q-pa-sm" rounded>
                        <q-icon name="check" class="q-mr-xs" />
                        Member
                      </q-badge>
                    </q-item-section>
                    
                    <q-item-section side v-else>
                      <q-btn
                        flat
                        round
                        color="secondary"
                        icon="chevron_right"
                        @click="openUserProfile(user.id)"
                      />
                    </q-item-section>
                  </q-item>
                </q-card>
              </div>
            </div>

            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </template>

            <!-- Пустое состояние -->
            <div v-if="!SearchStoreUser.isLoading && SearchStoreUser.items.length === 0 && SearchStoreUser.query.length >= 2" 
                 class="flex flex-center column q-pa-xl text-grey-6 text-center">
              <q-icon name="person_search" size="64px" class="q-mb-md" />
              <div class="text-h6">No users found</div>
              <div>Try a different username or email</div>
            </div>
          </q-infinite-scroll>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md bg-white border-top">
        <q-btn flat label="Close" color="primary" v-close-popup class="text-weight-bold" />
      </q-card-actions>

      <UserProfileDialog v-model="showProfile" :user-id="selectedUserId" />
    </q-card>
  </q-dialog>
</template>

<style scoped>
.vibrant-search-card {
  border-radius: 20px;
  overflow: hidden;
}

.search-input-hero :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
}

.user-result-card {
  border-radius: 12px;
  border: 1px solid transparent;
  background: white;
}

.user-result-card:hover {
  border-color: var(--q-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.hover-scale:hover {
  transform: scale(1.1);
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.opacity-80 {
  opacity: 0.8;
}

.border-top {
  border-top: 1px solid #edf2f7;
}
</style>
