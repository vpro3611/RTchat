

export const ConversationType = {
    DIRECT: "direct",
    GROUP: "group",
} as const;

export type ConversationType = typeof ConversationType[keyof typeof ConversationType];