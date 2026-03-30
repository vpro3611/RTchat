import {UserRepoWriter} from "../ports/user_repo_interfaces";
import {Pool, PoolClient} from "pg";
import {User} from "../domain/user";
import {
    DatabaseConnectionError,
    DatabaseQueryError,
    DatabaseUniqueConstraintError, EmailAlreadyExistDatabaseError,
    TableNotFoundError, UsernameAlreadyExistDatabaseError
} from "../errors/user_database_error";


export class UserRepoWriterPg implements UserRepoWriter {
    constructor(private readonly pool: Pool | PoolClient) {}


    private mapSaveError(error: any): never {
        // unique violation
        if (error.code === '23505') {

            if (error.constraint?.includes('username')) {
                throw new UsernameAlreadyExistDatabaseError('USERNAME_ALREADY_EXISTS');
            }

            if (error.constraint?.includes('email')) {
                throw new EmailAlreadyExistDatabaseError('EMAIL_ALREADY_EXISTS');
            }

            throw new DatabaseUniqueConstraintError('UNIQUE_CONSTRAINT_VIOLATION');
        }

        // table not found
        if (error.code === '42P01') {
            throw new TableNotFoundError('TABLE_NOT_FOUND');
        }

        // connection errors
        if (error.code?.startsWith('08')) {
            throw new DatabaseConnectionError('DATABASE_CONNECTION_ERROR');
        }

        throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
    }

    private mapToDomain(row: any): User {
        return User.restore(
            row.id,
            row.username,
            row.email,
            row.password_hash,
            row.is_active,
            row.is_verified,
            row.last_seen_at,
            row.created_at,
            row.updated_at,
            row.avatar_id,
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
                    is_verified,
                    last_seen_at,
                    created_at,
                    updated_at,
                    avatar_id
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                    ON CONFLICT (id)
            DO UPDATE SET
                    username = EXCLUDED.username,
                                       email = EXCLUDED.email,
                                       password_hash = EXCLUDED.password_hash,
                                       is_active = EXCLUDED.is_active,
                                       is_verified = EXCLUDED.is_verified, 
                                       last_seen_at = EXCLUDED.last_seen_at,
                                       updated_at = NOW(),
                                       avatar_id = EXCLUDED.avatar_id
                                       RETURNING *;
            `;

            const values = [
                user.id,
                user.getUsername().getValue(),
                user.getEmail().getValue(),
                user.getPassword().getHash(),
                user.getIsActive(),
                user.getIsVerified(),
                user.getLastSeenAt(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getAvatarId(),
            ];

            const result = await this.pool.query(query, values);

            const row = result.rows[0];

            return this.mapToDomain(row);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async markAsVerified(userId: string): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET is_verified = true, updated_at = NOW()
                WHERE id = $1
            `;
            await this.pool.query(query, [userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async setPendingEmail(userId: string, email: string): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET pending_email = $1, updated_at = NOW()
                WHERE id = $2
            `;
            await this.pool.query(query, [email, userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async confirmPendingEmail(userId: string): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET email = pending_email, updated_at = NOW(), pending_email = NULL
                WHERE id = $1 AND pending_email IS NOT NULL
            `;
            await this.pool.query(query, [userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async setPendingPassword(userId: string, password: string): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET pending_password = $1, updated_at = NOW()
                WHERE id = $2
            `;
            await this.pool.query(query, [password, userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async confirmPendingPassword(userId: string): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET password_hash = pending_password, updated_at = NOW(), pending_password = NULL
                WHERE id = $1 AND pending_password IS NOT NULL
            `;
            await this.pool.query(query, [userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async setPendingIsActive(userId: string): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET pending_is_active = TRUE, updated_at = NOW()
                WHERE id = $1
            `;
            await this.pool.query(query, [ userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async confirmPendingIsActive(userId: string): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET is_active = pending_is_active, updated_at = NOW(), pending_is_active = NULL
                WHERE id = $1 AND pending_is_active IS NOT NULL
            `;
            await this.pool.query(query, [userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }

    async updateAvatarId(userId: string, avatarId: string | null): Promise<void> {
        try {
            const query = "UPDATE users SET avatar_id = $1 WHERE id = $2";
            await this.pool.query(query, [avatarId, userId]);
        } catch (error) {
            this.mapSaveError(error);
        }
    }
}