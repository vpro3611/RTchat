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

    private mapDoDomain(row: any): User {
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

            const user = this.mapDoDomain(row);

            return user;
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

            const user = this.mapDoDomain(row);

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

            const user = this.mapDoDomain(row);

            return user;
        } catch (error: any) {
            this.mapError(error);
        }
    }
}