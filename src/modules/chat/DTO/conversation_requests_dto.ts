import {ConversationReqStatus} from "../domain/conversation_requests/conversation_requests";


export type ConversationRequestsDto = {
    id: string,
    conversationId: string,
    userId: string,
    status: string,
    requestMessage: string,
    submittedAt: string,
    reviewedAt: string | null,
    reviewedBy: string | null,
    reviewedMessage: string | null,
}