import { User } from "../domain/user";

export interface UserRepoReader {
    getUserById(id: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
}

export interface UserRepoWriter {
    save(user: User): Promise<User>;
}