
export const ConversationRequestsStatus = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
    WITHDRAWN: "withdrawn",
} as const;


export type ConversationReqStatus = typeof ConversationRequestsStatus[keyof typeof ConversationRequestsStatus];


export class ConversationRequests {
    constructor(
        public readonly id: string,
        private readonly conversationId: string,
        private readonly userId: string,
        private status: ConversationReqStatus,
        private requestMessage: string,
        private submittedAt: Date,
        private reviewedAt: Date | null,
        private reviewedBy: string | null,
        private reviewedMessage: string | null,
        private isDeleted: boolean,
    ) {}

    static create(
        conversationId: string,
        userId: string,
        requestMessage: string,
    ): ConversationRequests {
        return new ConversationRequests(
            crypto.randomUUID(),
            conversationId,
            userId,
            ConversationRequestsStatus.PENDING,
            requestMessage,
            new Date(),
            null,
            null,
            null,
            false,
        );
    };

    static restore(
        id: string,
        conversationId: string,
        userId: string,
        status: ConversationReqStatus,
        requestMessage: string,
        submittedAt: Date,
        reviewedAt: Date | null,
        reviewedBy: string | null,
        reviewedMessage: string,
        isDeleted: boolean,
    ) {
        return new ConversationRequests(
            id,
            conversationId,
            userId,
            status,
            requestMessage,
            submittedAt,
            reviewedAt,
            reviewedBy,
            reviewedMessage,
            isDeleted,
        );
    };

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