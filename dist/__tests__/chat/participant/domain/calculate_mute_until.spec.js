"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculate_mute_until_1 = require("../../../../src/modules/chat/domain/participant/calculate_mute_until");
const mute_duration_1 = require("../../../../src/modules/chat/domain/participant/mute_duration");
describe("calculateMuteUntil", () => {
    function expectTimeDifference(result, expectedMs) {
        expect(result).not.toBeNull();
        const now = Date.now();
        const diff = result.getTime() - now;
        // допускаем погрешность ~1 сек
        expect(diff).toBeGreaterThan(expectedMs - 1000);
        expect(diff).toBeLessThan(expectedMs + 1000);
    }
    it("should calculate 1 hour mute", () => {
        const result = (0, calculate_mute_until_1.calculateMuteUntil)(mute_duration_1.MuteDuration.ONE_HOUR);
        expectTimeDifference(result, 60 * 60 * 1000);
    });
    it("should calculate 8 hours mute", () => {
        const result = (0, calculate_mute_until_1.calculateMuteUntil)(mute_duration_1.MuteDuration.EIGHT_HOURS);
        expectTimeDifference(result, 8 * 60 * 60 * 1000);
    });
    it("should calculate 1 day mute", () => {
        const result = (0, calculate_mute_until_1.calculateMuteUntil)(mute_duration_1.MuteDuration.ONE_DAY);
        expectTimeDifference(result, 24 * 60 * 60 * 1000);
    });
    it("should calculate 1 week mute", () => {
        const result = (0, calculate_mute_until_1.calculateMuteUntil)(mute_duration_1.MuteDuration.ONE_WEEK);
        expectTimeDifference(result, 7 * 24 * 60 * 60 * 1000);
    });
    it("should return null for forever mute", () => {
        const result = (0, calculate_mute_until_1.calculateMuteUntil)(mute_duration_1.MuteDuration.FOREVER);
        expect(result).toBeNull();
    });
});
