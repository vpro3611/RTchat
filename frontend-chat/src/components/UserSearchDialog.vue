<script setup lang="ts">
import { watch } from "vue"
import { debounce } from "lodash"

import { SearchStoreUser } from "stores/user_search_store"
import { UserApi } from "src/api/apis/user_api"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(["update:modelValue"])

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
            >
              <q-item-section class="text-black">
                {{user.username}}
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

    </q-card>
  </q-dialog>
</template>
