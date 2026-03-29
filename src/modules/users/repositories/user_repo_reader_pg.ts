import {Pool, PoolClient} from "pg";
import {UserRepoReader} from "../ports/user_repo_interfaces";
import {User} from "../domain/user";
import {
    ColumnNotFoundError,
    DatabaseConnectionError,
    DatabaseQueryError,
    TableNotFoundError
} from "../errors/user_database_error";

export class UserRepoReaderPg implements UserRepoReader{
    constructor(private readonly pool: Pool | PoolClient) {}

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
        );
    }

    private mapError(error: any): never {
        if (error.code === '42P01') {
            throw new TableNotFoundError('TABLE_NOT_FOUND');
        }

        if (error.code === '42703') {
            throw new ColumnNotFoundError('COLUMN_NOT_FOUND');
        }

        if (error.code?.startsWith('08')) {
            throw new DatabaseConnectionError('DATABASE_CONNECTION_ERROR');
        }

        throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
    }


    async getUserById(id: string): Promise<User | null> {
        try {
            const query = `SELECT *
                           FROM users
                           WHERE id = $1`;
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];

            const user = this.mapToDomain(row);

            return user;
        } catch (error: any) {
            this.mapError(error);
        }
    }

    async getPendingEmailByUserId(id: string): Promise<string | null> {
        try {
            const query = `SELECT pending_email
                           FROM users
                           WHERE id = $1`;
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0].pending_email ?? null;
        } catch (error: any) {
            this.mapError(error);
        }
    }

    async getPendingPasswordByUserId(id: string): Promise<string | null> {
        try {
            const query = `SELECT pending_password
                           FROM users
                           WHERE id = $1`;
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0].pending_password ?? null;
        } catch (error: any) {
            this.mapError(error);
        }
    }

    async getPendingIsActiveByUserId(id: string): Promise<boolean | null> {
        try {
            const query = `SELECT pending_is_active
                           FROM users
                           WHERE id = $1`;
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0].pending_is_active ?? null;
        } catch (error: any) {
            this.mapError(error);
        }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        try {
            const query = `SELECT *
                           FROM users
                           WHERE username = $1`;
            const result = await this.pool.query(query, [username]);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];

            const user = this.mapToDomain(row);

            return user;
        } catch (error: any) {
            this.mapError(error);
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const query = `SELECT *
                           FROM users
                           WHERE email = $1`;
            const result = await this.pool.query(query, [email]);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];

            const user = this.mapToDomain(row);

            return user;
        } catch (error: any) {
            this.mapError(error);
        }
    }

    async searchUsers(query: string, limit = 20, cursor?: string): Promise<{items: User[], nextCursor?: string}> {
        try {
            const result = await this.pool.query(
                `
                    WITH users_page AS (SELECT u.*,
                                                   similarity(u.username, $1) AS score
                                        FROM users u
                                        WHERE u.username
                        ILIKE '%' || $1 || '%'
                        AND ($2::text IS NULL OR u.username
                       > $2)
                        AND u.is_active = true
                        AND u.is_verified = true
                    ORDER BY score DESC, u.username ASC
                        LIMIT $3 + 1
                        )
                    SELECT *,
                           (SELECT username
                            FROM users_page OFFSET $3
                        LIMIT 1 ) AS next_cursor
                    FROM users_page
                        LIMIT $3
                `,
                [query, cursor ?? null, limit]
            )

            const rows = result.rows

            return {
                items: rows.map(r => this.mapToDomain(r)),
                nextCursor: rows[0]?.next_cursor ?? undefined
            }
        } catch (error: any) {
            this.mapError(error);
        }
    }
}