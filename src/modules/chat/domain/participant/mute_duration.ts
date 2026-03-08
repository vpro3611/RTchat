

export const MuteDuration = {
    ONE_HOUR: "1h",
    EIGHT_HOURS: "8h",
    ONE_DAY: "1d",
    ONE_WEEK: "1w",
    FOREVER: "forever",
} as const;

export type MuteDuration = typeof MuteDuration[keyof typeof MuteDuration];