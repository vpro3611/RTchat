"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRequests = exports.ConversationRequestsStatus = void 0;
exports.ConversationRequestsStatus = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
    WITHDRAWN: "withdrawn",
};
class ConversationRequests {
    id;
    conversationId;
    userId;
    status;
    requestMessage;
    submittedAt;
    reviewedAt;
    reviewedBy;
    reviewedMessage;
    isDeleted;
    constructor(id, conversationId, userId, status, requestMessage, submittedAt, reviewedAt, reviewedBy, reviewedMessage, isDeleted) {
        this.id = id;
        this.conversationId = conversationId;
        this.userId = userId;
        this.status = status;
        this.requestMessage = requestMessage;
        this.submittedAt = submittedAt;
        this.reviewedAt = reviewedAt;
        this.reviewedBy = reviewedBy;
        this.reviewedMessage = reviewedMessage;
        this.isDeleted = isDeleted;
    }
    static create(conversationId, userId, requestMessage) {
        return new ConversationRequests(crypto.randomUUID(), conversationId, userId, exports.ConversationRequestsStatus.PENDING, requestMessage, new Date(), null, null, null, false);
    }
    ;
    static restore(id, conversationId, userId, status, requestMessage, submittedAt, reviewedAt, reviewedBy, reviewedMessage, isDeleted) {
        return new ConversationRequests(id, conversationId, userId, status, requestMessage, submittedAt, reviewedAt, reviewedBy, reviewedMessage, isDeleted);
    }
    ;
    getConversationId = () => this.conversationId;
    getUserId = () => this.userId;
    getStatus = () => this.status;
    getRequestMessage = () => this.requestMessage;
    getSubmittedAt = () => this.submittedAt;
    getReviewedAt = () => this.reviewedAt;
    getReviewedBy = () => this.reviewedBy;
    getReviewedMessage = () => this.reviewedMessage;
    getIsDeleted = () => this.isDeleted;
}
exports.ConversationRequests = ConversationRequests;
