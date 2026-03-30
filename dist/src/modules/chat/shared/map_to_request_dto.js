"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapToRequestDto = void 0;
class MapToRequestDto {
    mapToRequestDto(request) {
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
        };
    }
}
exports.MapToRequestDto = MapToRequestDto;
