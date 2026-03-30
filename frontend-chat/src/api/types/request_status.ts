
export const ConversationRequestsStatusFrontend = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  WITHDRAWN: "withdrawn",
} as const;


export type ConversationRequestsStatusFrontend = typeof ConversationRequestsStatusFrontend[keyof typeof ConversationRequestsStatusFrontend];
