import {ConversationRequests} from "../domain/conversation_requests/conversation_requests";
import {ConversationRequestsDto} from "../DTO/conversation_requests_dto";


export class MapToRequestDto {
    mapToRequestDto(request: ConversationRequests): ConversationRequestsDto {
        return {
            id: request.id,
            conversationId: request.getConversationId(),
            userId: request.getUserId(),
            status: request.getStatus(),
            requestMessage: request.getRequestMessage(),
            submittedAt: request.getSubmittedAt().toISOString(),
            reviewedAt: request.getReviewedAt()?.toISOString() ?? null,
            reviewedBy: request.getReviewedBy() ?? null,
            reviewedMessage: request.getReviewedMessage() ?? null,
        }
    }
}