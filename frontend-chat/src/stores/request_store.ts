import { reactive } from "vue"
import { ParticipantApi } from "src/api/apis/participant_api"
import type { ConversationRequestsResponse } from "src/api/types/conversation_request_response"
import type { ConversationRequestsStatusFrontend } from "src/api/types/request_status"

export const RequestStore = reactive({
  // Запросы для конкретной беседы (для владельца)
  convRequests: [] as ConversationRequestsResponse[],
  isConvLoading: false,

  // Мои запросы (отправленные мной)
  myRequests: [] as ConversationRequestsResponse[],
  isMyLoading: false,

  async fetchConvRequests(conversationId: string, status?: ConversationRequestsStatusFrontend) {
    this.isConvLoading = true
    try {
      this.convRequests = await ParticipantApi.getAllRequestsListConv(conversationId, status)
    } finally {
      this.isConvLoading = false
    }
  },

  async fetchMyRequests(status?: ConversationRequestsStatusFrontend) {
    this.isMyLoading = true
    try {
      this.myRequests = await ParticipantApi.getRequestsUserList(status)
    } finally {
      this.isMyLoading = false
    }
  },

  async fetchSpecificConvRequest(conversationId: string, requestId: string) {
    const req = await ParticipantApi.getSpecificRequestGroup(conversationId, requestId)
    const index = this.convRequests.findIndex(r => r.id === requestId)
    if (index !== -1) {
      this.convRequests[index] = req
    } else {
      this.convRequests.push(req)
    }
    return req
  },

  async fetchSpecificMyRequest(requestId: string) {
    const req = await ParticipantApi.getSpecificRequestUser(requestId)
    const index = this.myRequests.findIndex(r => r.id === requestId)
    if (index !== -1) {
      this.myRequests[index] = req
    } else {
      this.myRequests.push(req)
    }
    return req
  },

  async changeStatus(conversationId: string, requestId: string, status: ConversationRequestsStatusFrontend, reviewMessage: string) {
    const updated = await ParticipantApi.changeConversationRequestStatus(conversationId, requestId, status, reviewMessage)
    // Обновляем в списке convRequests
    const index = this.convRequests.findIndex(r => r.id === requestId)
    if (index !== -1) {
      this.convRequests[index] = updated
    }
    return updated
  },

  async withdrawRequest(requestId: string) {
    const updated = await ParticipantApi.withdrawRequestUser(requestId)
    // Обновляем в списке myRequests
    const index = this.myRequests.findIndex(r => r.id === requestId)
    if (index !== -1) {
      this.myRequests[index] = updated
    }
    return updated
  },

  async removeRequest(requestId: string) {
    await ParticipantApi.removeRequestUser(requestId)
    // Удаляем из списка myRequests
    this.myRequests = this.myRequests.filter(r => r.id !== requestId)
  }
})
