<script setup lang="ts">
import { ref } from "vue"
import { useQuasar } from "quasar"
import { RequestStore } from "stores/request_store"
import { UserCacheStore } from "stores/user_cache_store"
import type { ConversationRequestsResponse } from "src/api/types/conversation_request_response"

const $q = useQuasar()
const isOpen = ref(false)
const isLoading = ref(false)
const request = ref<ConversationRequestsResponse | null>(null)

async function open(requestId: string, conversationId?: string) {
  isOpen.value = true
  isLoading.value = true
  request.value = null
  
  try {
    if (conversationId) {
      request.value = await RequestStore.fetchSpecificConvRequest(conversationId, requestId)
    } else {
      request.value = await RequestStore.fetchSpecificMyRequest(requestId)
    }
    
    if (request.value) {
      void UserCacheStore.ensureUser(request.value.userId)
      if (request.value.reviewedBy) {
        void UserCacheStore.ensureUser(request.value.reviewedBy)
      }
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load request details'
    })
    isOpen.value = false
  } finally {
    isLoading.value = false
  }
}

defineExpose({ open })

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
    <q-card style="min-width: 400px; max-width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Request Details</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div v-if="isLoading" class="flex flex-center q-pa-lg">
          <q-spinner color="primary" size="3em" />
        </div>
        
        <div v-else-if="request" class="q-gutter-y-md">
          <div class="row items-center q-gutter-x-md">
            <q-avatar color="primary" text-color="white">
              {{ UserCacheStore.getUsername(request.userId)?.[0]?.toUpperCase() || '?' }}
            </q-avatar>
            <div>
              <div class="text-weight-bold text-subtitle1">
                {{ UserCacheStore.getUsername(request.userId) || 'Loading...' }}
              </div>
              <div class="text-caption text-grey">
                User ID: {{ request.userId }}
              </div>
            </div>
          </div>

          <q-separator />

          <div>
            <div class="text-overline">Request Message</div>
            <div class="bg-grey-2 q-pa-md rounded-borders text-body2">
              {{ request.requestMessage }}
            </div>
          </div>

          <div class="row justify-between items-center">
            <div>
              <div class="text-overline">Status</div>
              <q-badge :color="getStatusColor(request.status)" class="q-pa-xs">
                {{ request.status.toUpperCase() }}
              </q-badge>
            </div>
            <div class="text-right">
              <div class="text-overline">Submitted At</div>
              <div class="text-caption">{{ new Date(request.submittedAt).toLocaleString() }}</div>
            </div>
          </div>

          <div v-if="request.reviewedAt" class="bg-blue-1 q-pa-md rounded-borders">
            <div class="text-weight-bold q-mb-xs">Review Details</div>
            <div class="row justify-between text-caption q-mb-sm">
              <span>Reviewed by: {{ request.reviewedBy ? UserCacheStore.getUsername(request.reviewedBy) : 'System' }}</span>
              <span>{{ new Date(request.reviewedAt).toLocaleString() }}</span>
            </div>
            <div v-if="request.reviewedMessage" class="text-body2 italic">
              "{{ request.reviewedMessage }}"
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
