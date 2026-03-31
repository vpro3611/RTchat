<script setup lang="ts">
import { ref } from "vue"
import { useQuasar } from "quasar"
import { ParticipantApi } from "src/api/apis/participant_api"
import { RequestStore } from "stores/request_store"
import { UserCacheStore } from "stores/user_cache_store"
import type { ConversationRequestsStatusFrontend } from "src/api/types/request_status"
import RequestDetailsDialog from "components/RequestDetailsDialog.vue"

const props = defineProps<{
  conversationId: string
}>()

const $q = useQuasar()
const isOpen = ref(false)
const selectedStatus = ref<ConversationRequestsStatusFrontend | 'all'>('pending')
const detailsDialogRef = ref<InstanceType<typeof RequestDetailsDialog> | null>(null)

async function loadRequests() {
  await RequestStore.fetchConvRequests(
    props.conversationId,
    selectedStatus.value === 'all' ? undefined : selectedStatus.value
  )
  
  // Кэшируем имена пользователей
  const userIds = RequestStore.convRequests.map(r => r.userId)
  void UserCacheStore.ensureUsers(userIds)
}

function open() {
  isOpen.value = true
  void loadRequests()
}

function showDetails(requestId: string) {
  detailsDialogRef.value?.open(requestId, props.conversationId)
}

defineExpose({ open })

const emit = defineEmits(['accepted'])

function handleAction(requestId: string, status: 'accepted' | 'rejected') {
  $q.dialog({
    title: status === 'accepted' ? 'Accept Request' : 'Reject Request',
    message: `Enter a review message for the user (optional):`,
    prompt: {
      model: '',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk((reviewMessage: string) => {
    void (async () => {
      try {
        const updated = await RequestStore.changeStatus(
          props.conversationId,
          requestId,
          status as ConversationRequestsStatusFrontend,
          reviewMessage
        )
        $q.notify({
          type: 'positive',
          message: `Request ${status} successfully`
        })
        
        if (status === 'accepted') {
          try {
            const pRes = await ParticipantApi.getSpecificParticipant(props.conversationId, updated.userId)
            emit('accepted', pRes.participant)
          } catch (e) {
            console.error('Failed to fetch new participant details:', e)
            // Фоллбек на обычное обновление
            emit('accepted')
          }
        }
        
        void loadRequests()
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to update request status'
        })
      }
    })()
  })
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
        <div class="text-h6">Join Requests</div>
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
          <q-list separator v-if="RequestStore.convRequests.length > 0">
            <q-item v-for="req in RequestStore.convRequests" :key="req.id">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ UserCacheStore.getUsername(req.userId)?.[0]?.toUpperCase() || '?' }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ UserCacheStore.getUsername(req.userId) || 'Loading...' }}
                </q-item-label>
                <q-item-label caption lines="2">
                  {{ req.requestMessage }}
                </q-item-label>
                <q-item-label caption>
                  Submitted: {{ new Date(req.submittedAt).toLocaleString() }}
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

              <q-item-section side v-if="req.status === 'pending'">
                <div class="row q-gutter-xs">
                  <q-btn
                    round
                    dense
                    flat
                    color="primary"
                    icon="info"
                    @click="showDetails(req.id)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    color="positive"
                    icon="check"
                    @click="handleAction(req.id, 'accepted')"
                  >
                    <q-tooltip>Accept</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    color="negative"
                    icon="close"
                    @click="handleAction(req.id, 'rejected')"
                  >
                    <q-tooltip>Reject</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else-if="!RequestStore.isConvLoading" class="text-center q-pa-lg text-grey">
            No requests found
          </div>
          <div v-if="RequestStore.isConvLoading" class="text-center q-pa-lg">
            <q-spinner color="primary" size="3em" />
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>

    <RequestDetailsDialog ref="detailsDialogRef" />
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 12px;
}

.q-item {
  transition: background 0.2s;
  border-radius: 8px;
  margin: 4px 8px;
}

.q-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .q-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
