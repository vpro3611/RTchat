"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const email_1 = require("./email");
const password_1 = require("./password");
const Username_1 = require("./Username");
const user_domain_errors_1 = require("../errors/user_domain_errors");
class User {
    id;
    username;
    email;
    password;
    is_active;
    is_verified;
    last_seen_at;
    created_at;
    updated_at;
    avatar_id;
    constructor(id, username, email, password, is_active, is_verified, last_seen_at, created_at, updated_at, avatar_id = null) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.is_active = is_active;
        this.is_verified = is_verified;
        this.last_seen_at = last_seen_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.avatar_id = avatar_id;
    }
    static restore(id, username, email, password, is_active, is_verified, last_seen_at, created_at, updated_at, avatar_id = null) {
        return new User(id, Username_1.Username.create(username), email_1.Email.create(email), password_1.Password.fromHash(password), is_active, is_verified, last_seen_at, created_at, updated_at, avatar_id);
    }
    ensureIsActive() {
        if (!this.is_active) {
            throw new user_domain_errors_1.UserNotActiveError(`User: ${this.getUsername().getValue()} is not active`);
        }
    }
    ensureIsVerified() {
        if (!this.is_verified) {
            throw new user_domain_errors_1.UserIsNotVerifiedError(`User: ${this.getUsername().getValue()} is not verified`);
        }
    }
    canChangeUsername(newUsername) {
        if (this.username.getValue() === newUsername.getValue() ||
            !this.is_active ||
            !this.is_verified) {
            throw new user_domain_errors_1.CannotChangeUsernameError(`New username: ${newUsername.getValue()} cannot be the same as the old one: ${this.getUsername().getValue()},
             or user is not active or not verified`);
        }
    }
    canChangeEmail(newEmail) {
        if (this.email.getValue() === newEmail.getValue() ||
            !this.is_active ||
            !this.is_verified) {
            throw new user_domain_errors_1.CannotChangeEmailError(`New email: ${newEmail.getValue()} cannot be the same as the old one: ${this.getEmail().getValue()},
             or user is not active or not verified`);
        }
    }
    ensureIsVerifiedAndActive() {
        if (!this.is_active || !this.is_verified) {
            throw new user_domain_errors_1.NotActiveOrVerifiedError(`User ${this.getUsername().getValue()} is not active or not verified`);
        }
    }
    canLogin() {
        if (!this.is_active || !this.is_verified) {
            throw new user_domain_errors_1.CannotLoginError(`User: ${this.getUsername().getValue()} is not active or not verified thus cannot login`);
        }
    }
    static create(username, email, password) {
        return new User(crypto.randomUUID(), username, email, password, true, false, new Date(), new Date(), new Date(), null);
    }
    ;
    setUsername(username) {
        this.canChangeUsername(username);
        this.username = username;
        this.setUpdatedAt(new Date());
    }
    setEmail(email) {
        this.canChangeEmail(email);
        this.email = email;
        this.setUpdatedAt(new Date());
    }
    setPassword(password) {
        this.ensureIsVerifiedAndActive();
        this.password = password;
        this.setUpdatedAt(new Date());
    }
    setIsActive() {
        this.ensureIsVerified();
        this.is_active = !this.is_active;
        this.setUpdatedAt(new Date());
    }
    setLastSeenAt(date) {
        this.last_seen_at = date;
    }
    setUpdatedAt(date) {
        this.updated_at = date;
    }
    getUsername() {
        return this.username;
    }
    getEmail() {
        return this.email;
    }
    getPassword() {
        return this.password;
    }
    getIsActive() {
        return this.is_active;
    }
    getIsVerified() {
        return this.is_verified;
    }
    getLastSeenAt() {
        return this.last_seen_at;
    }
    getCreatedAt() {
        return this.created_at;
    }
    getUpdatedAt() {
        return this.updated_at;
    }
    getCreatedAtString() {
        return this.created_at;
    }
    getUpdatedAtString() {
        return this.updated_at;
    }
    getAvatarId() {
        return this.avatar_id;
    }
}
exports.User = User;
