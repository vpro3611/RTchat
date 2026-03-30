

export const ParticipantRole = {
    MEMBER: 'member',
    OWNER: 'owner',
} as const;

export type ParticipantRole = typeof ParticipantRole[keyof typeof ParticipantRole];