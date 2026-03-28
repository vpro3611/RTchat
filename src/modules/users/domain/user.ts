import {Email} from "./email";
import {Password} from "./password";
import {Username} from "./Username";
import {
    CannotChangeEmailError,
    CannotChangeUsernameError, CannotLoginError, NotActiveOrVerifiedError,
    UserIsNotVerifiedError,
    UserNotActiveError
} from "../errors/user_domain_errors";


export class User {
    constructor(
        public readonly id: string,
        private username: Username,
        private email: Email,
        private password: Password,
        private is_active: boolean,
        private is_verified: boolean,
        private last_seen_at: Date,
        private readonly created_at: Date,
        private updated_at: Date,
        private avatar_id: string | null = null,
    ) {}

    static restore(
        id: string,
        username: string,
        email: string,
        password: string,
        is_active: boolean,
        is_verified: boolean,
        last_seen_at: Date,
        created_at: Date,
        updated_at: Date,
        avatar_id: string | null = null,
    ): User {
        return new User(
            id,
            Username.create(username),
            Email.create(email),
            Password.fromHash(password),
            is_active,
            is_verified,
            last_seen_at,
            created_at,
            updated_at,
            avatar_id,
        );
    }

    ensureIsActive(): void {
        if (!this.is_active) {
            throw new UserNotActiveError(`User: ${this.getUsername().getValue()} is not active`);
        }
    }

    ensureIsVerified(): void {
        if (!this.is_verified) {
            throw new UserIsNotVerifiedError(`User: ${this.getUsername().getValue()} is not verified`);
        }
    }

    canChangeUsername(newUsername: Username): void {
        if (
            this.username.getValue() === newUsername.getValue() ||
            !this.is_active ||
            !this.is_verified
        )
        {
            throw new CannotChangeUsernameError(`New username: ${newUsername.getValue()} cannot be the same as the old one: ${this.getUsername().getValue()},
             or user is not active or not verified`
            );
        }
    }
    canChangeEmail(newEmail: Email): void {
        if (
            this.email.getValue() === newEmail.getValue() ||
            !this.is_active ||
            !this.is_verified
        )
        {
            throw new CannotChangeEmailError(`New email: ${newEmail.getValue()} cannot be the same as the old one: ${this.getEmail().getValue()},
             or user is not active or not verified`
            );
        }
    }

    ensureIsVerifiedAndActive(): void {
        if (!this.is_active || !this.is_verified) {
            throw new NotActiveOrVerifiedError(`User ${this.getUsername().getValue()} is not active or not verified`);
        }
    }

    canLogin(): void {
        if (!this.is_active || !this.is_verified) {
            throw new CannotLoginError(`User: ${this.getUsername().getValue()} is not active or not verified thus cannot login`);
        }
    }

    static create(
        username: Username,
        email: Email,
        password: Password,
    ): User {
        return new User(
            crypto.randomUUID(),
            username,
            email,
            password,
            true,
            false,
            new Date(),
            new Date(),
            new Date(),
            null,
        );
    };


    setUsername(username: Username): void {
        this.canChangeUsername(username);
        this.username = username;
        this.setUpdatedAt(new Date());
    }
    setEmail(email: Email): void {
        this.canChangeEmail(email);
        this.email = email;
        this.setUpdatedAt(new Date());
    }
    setPassword(password: Password): void {
        this.ensureIsVerifiedAndActive()
        this.password = password;
        this.setUpdatedAt(new Date());
    }
    setIsActive(): void {
        this.ensureIsVerified();
        this.is_active = !this.is_active;
        this.setUpdatedAt(new Date());
    }
    setLastSeenAt(date: Date): void {
        this.last_seen_at = date;
    }
    setUpdatedAt(date: Date): void {
        this.updated_at = date;
    }

    getUsername(): Username {
        return this.username;
    }
    getEmail(): Email {
        return this.email;
    }
    getPassword(): Password {
        return this.password;
    }
    getIsActive(): boolean {
        return this.is_active;
    }
    getIsVerified(): boolean {
        return this.is_verified;
    }
    getLastSeenAt(): Date {
        return this.last_seen_at;
    }
    getCreatedAt(): Date {
        return this.created_at;
    }
    getUpdatedAt(): Date {
        return this.updated_at;
    }
    getCreatedAtString(): Date {
        return this.created_at;
    }
    getUpdatedAtString(): Date {
        return this.updated_at;
    }
    getAvatarId(): string | null {
        return this.avatar_id;
    }
}