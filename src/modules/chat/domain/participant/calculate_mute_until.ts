import {MuteDuration} from "./mute_duration";


export function calculateMuteUntil(duration: MuteDuration): Date | null {
    const now = new Date();

    switch (duration) {
        case MuteDuration.ONE_HOUR:
            return new Date(now.getTime() + 60 * 60 * 1000);
        case MuteDuration.EIGHT_HOURS:
            return new Date(now.getTime() + 8 * 60 * 60 * 1000);
        case MuteDuration.ONE_DAY:
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case MuteDuration.ONE_WEEK:
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case MuteDuration.FOREVER:
            return null;
    }
}