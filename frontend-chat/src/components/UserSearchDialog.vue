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
  >
    <q-card style="width: 400px; max-width: 90vw;">

      <q-card-section>
        <div class="text-h6">Search users</div>
      </q-card-section>

      <q-card-section>

        <!--  напрямую в store -->
        <q-input
          v-model="SearchStoreUser.query"
          label="Type username..."
          outlined
          dense
          autofocus
        />

      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 400px" class="scroll">

        <q-infinite-scroll
          @load="loadMore"
          :offset="100"
          :disable="!SearchStoreUser.hasMore || SearchStoreUser.query.length < 2"
        >
          <q-list>

            <q-item
              v-for="user in SearchStoreUser.items"
              :key="user.id"
              clickable
              @click="openUserProfile(user.id)"
            >
              <q-item-section>
                <q-item-label class="text-black">{{user.username}}</q-item-label>
                <q-item-label caption>{{user.id}}</q-item-label>
              </q-item-section>

              <q-item-section side v-if="props.conversationId">
                <q-btn
                  v-if="!isAlreadyInGroup(user.id)"
                  flat
                  round
                  color="primary"
                  icon="person_add"
                  :loading="isAdding[user.id]"
                  @click.stop="addToGroup(user.id, user.username)"
                >
                  <q-tooltip>Add to Group</q-tooltip>
                </q-btn>
                <q-badge v-else color="positive" label="In group" />
              </q-item-section>
            </q-item>

          </q-list>

          <div v-if="SearchStoreUser.isLoading" class="text-center q-pa-md">
            Loading...
          </div>

          <div
            v-if="!SearchStoreUser.isLoading && SearchStoreUser.items.length === 0 && SearchStoreUser.query.length >= 2"
            class="text-center q-pa-md"
          >
            No users found
          </div>

        </q-infinite-scroll>

      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>

      <UserProfileDialog v-model="showProfile" :user-id="selectedUserId" />

    </q-card>
  </q-dialog>
</template>
