"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMuteUntil = calculateMuteUntil;
const mute_duration_1 = require("./mute_duration");
function calculateMuteUntil(duration) {
    const now = new Date();
    switch (duration) {
        case mute_duration_1.MuteDuration.ONE_HOUR:
            return new Date(now.getTime() + 60 * 60 * 1000);
        case mute_duration_1.MuteDuration.EIGHT_HOURS:
            return new Date(now.getTime() + 8 * 60 * 60 * 1000);
        case mute_duration_1.MuteDuration.ONE_DAY:
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case mute_duration_1.MuteDuration.ONE_WEEK:
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case mute_duration_1.MuteDuration.FOREVER:
            return null;
    }
}
