"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepoReaderPg = void 0;
const user_1 = require("../domain/user");
const user_database_error_1 = require("../errors/user_database_error");
class UserRepoReaderPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    mapToDomain(row) {
        return user_1.User.restore(row.id, row.username, row.email, row.password_hash, row.is_active, row.is_verified, row.last_seen_at, row.created_at, row.updated_at, row.avatar_id);
    }
    mapError(error) {
        if (error.code === '42P01') {
            throw new user_database_error_1.TableNotFoundError('TABLE_NOT_FOUND');
        }
        if (error.code === '42703') {
            throw new user_database_error_1.ColumnNotFoundError('COLUMN_NOT_FOUND');
        }
        if (error.code?.startsWith('08')) {
            throw new user_database_error_1.DatabaseConnectionError('DATABASE_CONNECTION_ERROR');
        }
        throw new user_database_error_1.DatabaseQueryError('DATABASE_QUERY_ERROR');
    }
    async getUserById(id) {
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
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async getPendingEmailByUserId(id) {
        try {
            const query = `SELECT pending_email
                           FROM users
                           WHERE id = $1`;
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0].pending_email ?? null;
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async getUserByUsername(username) {
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
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async getUserByEmail(email) {
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
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async searchUsers(query, limit = 20, cursor) {
        try {
            const result = await this.pool.query(`
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
                `, [query, cursor ?? null, limit]);
            const rows = result.rows;
            return {
                items: rows.map(r => this.mapToDomain(r)),
                nextCursor: rows[0]?.next_cursor ?? undefined
            };
        }
        catch (error) {
            this.mapError(error);
        }
    }
}
exports.UserRepoReaderPg = UserRepoReaderPg;
