"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../../../src/modules/users/domain/user");
const Username_1 = require("../../../src/modules/users/domain/Username");
const email_1 = require("../../../src/modules/users/domain/email");
const password_1 = require("../../../src/modules/users/domain/password");
const user_domain_errors_1 = require("../../../src/modules/users/errors/user_domain_errors");
/**
 * Test Data Builder
 */
function buildUser(overrides) {
    return user_1.User.restore("user-id", "john_doe", "john@test.com", "$hashedPassword", overrides?.is_active ?? true, overrides?.is_verified ?? true, new Date(), new Date(), new Date());
}
describe("User Domain Integration Tests", () => {
    // --------------------------
    // RESTORE
    // --------------------------
    it("should correctly restore user aggregate", () => {
        const user = buildUser();
        expect(user.getUsername().getValue()).toBe("john_doe");
        expect(user.getEmail().getValue()).toBe("john@test.com");
        expect(user.getIsActive()).toBe(true);
        expect(user.getIsVerified()).toBe(true);
    });
    // --------------------------
    // CREATE
    // --------------------------
    it("should create user with default domain state", () => {
        const user = user_1.User.create(Username_1.Username.create("new_user"), email_1.Email.create("new@test.com"), password_1.Password.fromHash("$hash"));
        expect(user.getIsActive()).toBe(true);
        expect(user.getIsVerified()).toBe(false);
        expect(user.id).toBeDefined();
    });
    // --------------------------
    // STATE GUARDS
    // --------------------------
    it("should throw if ensureIsActive when inactive", () => {
        const user = buildUser({ is_active: false });
        expect(() => user.ensureIsActive())
            .toThrow(user_domain_errors_1.UserNotActiveError);
    });
    it("should throw if ensureIsVerified when not verified", () => {
        const user = buildUser({ is_verified: false });
        expect(() => user.ensureIsVerified())
            .toThrow(user_domain_errors_1.UserIsNotVerifiedError);
    });
    it("should throw ensureIsVerifiedAndActive when not active", () => {
        const user = buildUser({ is_active: false });
        expect(() => user.ensureIsVerifiedAndActive())
            .toThrow(user_domain_errors_1.NotActiveOrVerifiedError);
    });
    // --------------------------
    // LOGIN
    // --------------------------
    it("should allow login when active and verified", () => {
        const user = buildUser();
        expect(() => user.canLogin()).not.toThrow();
    });
    it("should not allow login if not active", () => {
        const user = buildUser({ is_active: false });
        expect(() => user.canLogin())
            .toThrow(user_domain_errors_1.CannotLoginError);
    });
    it("should not allow login if not verified", () => {
        const user = buildUser({ is_verified: false });
        expect(() => user.canLogin())
            .toThrow(user_domain_errors_1.CannotLoginError);
    });
    // --------------------------
    // USERNAME
    // --------------------------
    it("should change username if valid", () => {
        const user = buildUser();
        const newUsername = Username_1.Username.create("new_username");
        user.setUsername(newUsername);
        expect(user.getUsername().getValue()).toBe("new_username");
    });
    it("should not allow same username", () => {
        const user = buildUser();
        const sameUsername = Username_1.Username.create("john_doe");
        expect(() => user.setUsername(sameUsername))
            .toThrow(user_domain_errors_1.CannotChangeUsernameError);
    });
    it("should not change username if inactive", () => {
        const user = buildUser({ is_active: false });
        const newUsername = Username_1.Username.create("new_username");
        expect(() => user.setUsername(newUsername))
            .toThrow(user_domain_errors_1.CannotChangeUsernameError);
    });
    // --------------------------
    // EMAIL
    // --------------------------
    it("should change email if valid", () => {
        const user = buildUser();
        const newEmail = email_1.Email.create("new@test.com");
        user.setEmail(newEmail);
        expect(user.getEmail().getValue()).toBe("new@test.com");
    });
    it("should not allow same email", () => {
        const user = buildUser();
        const sameEmail = email_1.Email.create("john@test.com");
        expect(() => user.setEmail(sameEmail))
            .toThrow(user_domain_errors_1.CannotChangeEmailError);
    });
    it("should not change email if not verified", () => {
        const user = buildUser({ is_verified: false });
        const newEmail = email_1.Email.create("new@test.com");
        expect(() => user.setEmail(newEmail))
            .toThrow(user_domain_errors_1.CannotChangeEmailError);
    });
    // --------------------------
    // PASSWORD
    // --------------------------
    it("should change password if verified and active", () => {
        const user = buildUser();
        const newPassword = password_1.Password.fromHash("$newHash");
        user.setPassword(newPassword);
        expect(user.getPassword()).toBe(newPassword);
    });
    it("should not change password if not verified", () => {
        const user = buildUser({ is_verified: false });
        expect(() => user.setPassword(password_1.Password.fromHash("$newHash"))).toThrow(user_domain_errors_1.NotActiveOrVerifiedError);
    });
    // --------------------------
    // ACTIVE TOGGLE
    // --------------------------
    it("should toggle active state if verified", () => {
        const user = buildUser({ is_active: true, is_verified: true });
        user.setIsActive();
        expect(user.getIsActive()).toBe(false);
    });
    it("should not toggle active if not verified", () => {
        const user = buildUser({ is_verified: false });
        expect(() => user.setIsActive())
            .toThrow(user_domain_errors_1.UserIsNotVerifiedError);
    });
    // --------------------------
    // LAST SEEN / UPDATED AT
    // --------------------------
    it("should update lastSeenAt", () => {
        const user = buildUser();
        const newDate = new Date("2025-01-01");
        user.setLastSeenAt(newDate);
        expect(user.getLastSeenAt()).toEqual(newDate);
    });
    it("should update updatedAt", () => {
        const user = buildUser();
        const newDate = new Date("2030-01-01");
        user.setUpdatedAt(newDate);
        expect(user.getUpdatedAt()).toEqual(newDate);
    });
});
