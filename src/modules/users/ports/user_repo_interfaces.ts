import { User } from "../domain/user";

export interface UserRepoReader {
    getUserById(id: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    searchUsers(query: string, limit?: number, cursor?: string): Promise<{items: User[], nextCursor?: string}>;
}

export interface UserRepoWriter {
    save(user: User): Promise<User>;
    markAsVerified(id: string): Promise<void>;
}