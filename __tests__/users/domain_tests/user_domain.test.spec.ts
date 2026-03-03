import { User } from "../../../src/modules/users/domain/user";
import { Username } from "../../../src/modules/users/domain/Username";
import { Email } from "../../../src/modules/users/domain/email";
import { Password } from "../../../src/modules/users/domain/password";
import {
    CannotChangeEmailError,
    CannotChangeUsernameError,
    CannotLoginError,
    NotActiveOrVerifiedError,
    UserIsNotVerifiedError,
    UserNotActiveError
} from "../../../src/modules/users/errors/user_domain_errors";

/**
 * Test Data Builder
 */
function buildUser(overrides?: Partial<{
    is_active: boolean;
    is_verified: boolean;
}>) {
    return User.restore(
        "user-id",
        "john_doe",
        "john@test.com",
        "$hashedPassword",
        overrides?.is_active ?? true,
        overrides?.is_verified ?? true,
        new Date(),
        new Date(),
        new Date(),
    );
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
        const user = User.create(
            Username.create("new_user"),
            Email.create("new@test.com"),
            Password.fromHash("$hash")
        );

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
            .toThrow(UserNotActiveError);
    });

    it("should throw if ensureIsVerified when not verified", () => {
        const user = buildUser({ is_verified: false });

        expect(() => user.ensureIsVerified())
            .toThrow(UserIsNotVerifiedError);
    });

    it("should throw ensureIsVerifiedAndActive when not active", () => {
        const user = buildUser({ is_active: false });

        expect(() => user.ensureIsVerifiedAndActive())
            .toThrow(NotActiveOrVerifiedError);
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
            .toThrow(CannotLoginError);
    });

    it("should not allow login if not verified", () => {
        const user = buildUser({ is_verified: false });

        expect(() => user.canLogin())
            .toThrow(CannotLoginError);
    });

    // --------------------------
    // USERNAME
    // --------------------------

    it("should change username if valid", () => {
        const user = buildUser();
        const newUsername = Username.create("new_username");

        user.setUsername(newUsername);

        expect(user.getUsername().getValue()).toBe("new_username");
    });

    it("should not allow same username", () => {
        const user = buildUser();
        const sameUsername = Username.create("john_doe");

        expect(() => user.setUsername(sameUsername))
            .toThrow(CannotChangeUsernameError);
    });

    it("should not change username if inactive", () => {
        const user = buildUser({ is_active: false });
        const newUsername = Username.create("new_username");

        expect(() => user.setUsername(newUsername))
            .toThrow(CannotChangeUsernameError);
    });

    // --------------------------
    // EMAIL
    // --------------------------

    it("should change email if valid", () => {
        const user = buildUser();
        const newEmail = Email.create("new@test.com");

        user.setEmail(newEmail);

        expect(user.getEmail().getValue()).toBe("new@test.com");
    });

    it("should not allow same email", () => {
        const user = buildUser();
        const sameEmail = Email.create("john@test.com");

        expect(() => user.setEmail(sameEmail))
            .toThrow(CannotChangeEmailError);
    });

    it("should not change email if not verified", () => {
        const user = buildUser({ is_verified: false });
        const newEmail = Email.create("new@test.com");

        expect(() => user.setEmail(newEmail))
            .toThrow(CannotChangeEmailError);
    });

    // --------------------------
    // PASSWORD
    // --------------------------

    it("should change password if verified and active", () => {
        const user = buildUser();

        const newPassword = Password.fromHash("$newHash");
        user.setPassword(newPassword);

        expect(user.getPassword()).toBe(newPassword);
    });

    it("should not change password if not verified", () => {
        const user = buildUser({ is_verified: false });

        expect(() =>
            user.setPassword(Password.fromHash("$newHash"))
        ).toThrow(NotActiveOrVerifiedError);
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
            .toThrow(UserIsNotVerifiedError);
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