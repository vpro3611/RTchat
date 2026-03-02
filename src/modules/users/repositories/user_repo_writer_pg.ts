import {UserRepoWriter} from "../ports/user_repo_interfaces";
import {Pool, PoolClient} from "pg";
import {User} from "../domain/user";


export class UserRepoWriterPg implements UserRepoWriter {
    constructor(private readonly pool: Pool | PoolClient) {}


    private mapSaveError(error: any): never {
        if (error.code === '22P02') {
            throw new Error('INVALID_UUID_FORMAT');
        }

        // unique violation
        if (error.code === '23505') {

            if (error.constraint?.includes('username')) {
                throw new Error('USERNAME_ALREADY_EXISTS');
            }

            if (error.constraint?.includes('email')) {
                throw new Error('EMAIL_ALREADY_EXISTS');
            }

            throw new Error('UNIQUE_CONSTRAINT_VIOLATION');
        }

        // table not found
        if (error.code === '42P01') {
            throw new Error('TABLE_NOT_FOUND');
        }

        // connection errors
        if (error.code?.startsWith('08')) {
            throw new Error('DATABASE_CONNECTION_ERROR');
        }

        throw new Error('DATABASE_QUERY_ERROR');
    }

    private mapToDomain(row: any): User {
        return User.restore(
            row.id,
            row.username,
            row.email,
            row.password_hash,
            row.is_active,
            row.last_seen_at,
            row.created_at,
            row.updated_at,
        )
    }

    async save(user: User): Promise<User> {
        try {
            const query = `
                INSERT INTO users (
                    id,
                    username,
                    email,
                    password_hash,
                    is_active,
                    last_seen_at,
                    created_at,
                    updated_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                    ON CONFLICT (id)
            DO UPDATE SET
                    username = EXCLUDED.username,
                                       email = EXCLUDED.email,
                                       password_hash = EXCLUDED.password_hash,
                                       is_active = EXCLUDED.is_active,
                                       last_seen_at = EXCLUDED.last_seen_at,
                                       updated_at = NOW()
                                       RETURNING *;
            `;

            const values = [
                user.id,
                user.getUsername().getValue(),
                user.getEmail().getValue(),
                user.getPassword().getHash(),
                user.getIsActive(),
                user.getLastSeenAt(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
            ];

            const result = await this.pool.query(query, values);

            const row = result.rows[0];

            return this.mapToDomain(row);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }
}