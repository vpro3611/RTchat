<script setup lang="ts">
import { ref } from "vue"
import { useQuasar } from "quasar"
import { RequestStore } from "stores/request_store"
import { ChatStore } from "stores/chat_store"
import type { ConversationRequestsStatusFrontend } from "src/api/types/request_status"
import RequestDetailsDialog from "components/RequestDetailsDialog.vue"

const $q = useQuasar()
const isOpen = ref(false)
const selectedStatus = ref<ConversationRequestsStatusFrontend | 'all'>('pending')
const detailsDialogRef = ref<InstanceType<typeof RequestDetailsDialog> | null>(null)

async function loadRequests() {
  await RequestStore.fetchMyRequests(
    selectedStatus.value === 'all' ? undefined : selectedStatus.value
  )
}

function open() {
  isOpen.value = true
  void loadRequests()
}

function showDetails(requestId: string) {
  detailsDialogRef.value?.open(requestId)
}

defineExpose({ open })

function withdraw(requestId: string) {
  $q.dialog({
    title: 'Withdraw Request',
    message: 'Are you sure you want to withdraw this join request?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await RequestStore.withdrawRequest(requestId)
        $q.notify({ type: 'positive', message: 'Request withdrawn' })
        void loadRequests()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to withdraw request' })
      }
    })()
  })
}

function remove(requestId: string) {
  $q.dialog({
    title: 'Remove Request',
    message: 'Remove this request from your history?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await RequestStore.removeRequest(requestId)
        $q.notify({ type: 'positive', message: 'Request removed' })
        void loadRequests()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to remove request' })
      }
    })()
  })
}

function getChatTitle(convId: string) {
  const chat = ChatStore.chats.find(c => c.id === convId)
  return chat?.title || `Group ${convId.slice(0, 8)}...`
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'orange'
    case 'accepted': return 'positive'
    case 'rejected': return 'negative'
    case 'withdrawn': return 'grey'
    default: return 'blue'
  }
}
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 500px; max-width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">My Outgoing Requests</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row q-mb-md">
          <q-btn-toggle
            v-model="selectedStatus"
            toggle-color="primary"
            flat
            @update:model-value="loadRequests"
            :options="[
              {label: 'Pending', value: 'pending'},
              {label: 'Accepted', value: 'accepted'},
              {label: 'Rejected', value: 'rejected'},
              {label: 'All', value: 'all'}
            ]"
          />
        </div>

        <q-scroll-area style="height: 400px;">
          <q-list separator v-if="RequestStore.myRequests.length > 0">
            <q-item v-for="req in RequestStore.myRequests" :key="req.id">
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ getChatTitle(req.conversationId) }}
                </q-item-label>
                <q-item-label caption lines="2">
                  My message: {{ req.requestMessage }}
                </q-item-label>
                <q-item-label caption>
                  Sent: {{ new Date(req.submittedAt).toLocaleString() }}
                </q-item-label>
                <div class="q-mt-xs">
                  <q-badge :color="getStatusColor(req.status)">
                    {{ req.status }}
                  </q-badge>
                </div>
                <q-item-label v-if="req.reviewedMessage" caption class="q-mt-sm italic">
                  Review: {{ req.reviewedMessage }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">

                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="info"
                    @click="showDetails(req.id)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="req.status === 'pending'"
                    flat
                    round
                    color="warning"
                    icon="undo"
                    @click="withdraw(req.id)"
                  >
                    <q-tooltip>Withdraw Request</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-else
                    flat
                    round
                    color="grey"
                    icon="delete"
                    @click="remove(req.id)"
                  >
                    <q-tooltip>Remove from History</q-tooltip>
                  </q-btn>

                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else-if="!RequestStore.isMyLoading" class="text-center q-pa-lg text-grey">
            No requests found
          </div>
          <div v-if="RequestStore.isMyLoading" class="text-center q-pa-lg">
            <q-spinner color="primary" size="3em" />
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>

    <RequestDetailsDialog ref="detailsDialogRef" />
  </q-dialog>
</template>
