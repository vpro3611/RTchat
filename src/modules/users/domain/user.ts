import {Email} from "./email";
import {Password} from "./password";
import {Username} from "./Username";


export class User {
    constructor(
        public readonly id: string,
        private username: Username,
        private email: Email,
        private password: Password,
        private is_active: boolean,
        private last_seen_at: Date,
        private readonly created_at: Date,
        private updated_at: Date,
    ) {}

    static restore(
        id: string,
        username: string,
        email: string,
        password: string,
        is_active: boolean,
        last_seen_at: Date,
        created_at: Date,
        updated_at: Date,
    ): User {
        return new User(
            id,
            Username.create(username),
            Email.create(email),
            Password.fromHash(password),
            is_active,
            last_seen_at,
            created_at,
            updated_at,
        );
    }

    ensureIsActive(): void {
        if (!this.is_active) {
            throw new Error('User is not active');
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
            new Date(),
            new Date(),
            new Date(),
        );
    };


    setUsername(username: Username): void {
        this.username = username;
    }
    setEmail(email: Email): void {
        this.email = email;
    }
    setPassword(password: Password): void {
        this.password = password;
    }
    setIsActive(): void {
        this.is_active = !this.is_active;
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
}