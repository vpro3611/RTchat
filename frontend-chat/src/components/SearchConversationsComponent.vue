<script setup lang="ts">
import { ref, watch } from "vue"
import { debounce } from "lodash"

import { SearchStore } from "stores/conversations_search_store"
import { UserApi } from "src/api/apis/user_api"

const query = ref("")

watch(query, debounce(async (val: string) => {
  if (!val || val.length < 2) {
    SearchStore.setQuery("")
    SearchStore.clear()
    return
  }

  SearchStore.setQuery(val)

  try {
    SearchStore.setLoading(true)

    const res = await UserApi.searchConversations(val)

    SearchStore.setResults(res.items, res.nextCursor ?? null)

  } finally {
    SearchStore.setLoading(false)
  }
}, 300))

async function loadMore(index: number, done: (stop?: boolean) => void) {
  if (!SearchStore.hasMore || SearchStore.isLoading) {
    done(true)
    return
  }

  try {
    SearchStore.setLoading(true)

    const res = await UserApi.searchConversations(
      SearchStore.query,
      SearchStore.nextCursor ?? undefined
    )

    SearchStore.appendResults(res.items, res.nextCursor ?? null)

    if (!res.nextCursor) {
      done(true)
    } else {
      done()
    }

  } catch (e) {
    console.error(e)
    done(true)
  } finally {
    SearchStore.setLoading(false)
  }
}
</script>

<template>
  <div>

    <q-input
      v-model="query"
      label="Search conversations"
      outlined
      dense
      class="q-mb-md"
    />

    <!--  показываем результаты только при поиске -->
    <div v-if="SearchStore.query">

      <q-infinite-scroll
        @load="loadMore"
        :offset="100"
        :disable="!SearchStore.hasMore"
      >
        <q-list>

          <q-item
            v-for="chat in SearchStore.items"
            :key="chat.id"
            clickable
          >
            <q-item-section>
              {{ chat.title }}
            </q-item-section>
          </q-item>

        </q-list>

        <div v-if="SearchStore.isLoading" class="text-center q-pa-md">
          Loading...
        </div>

        <div v-if="!SearchStore.isLoading && SearchStore.items.length === 0" class="text-center q-pa-md">
          No results
        </div>

      </q-infinite-scroll>

    </div>

  </div>
</template>
