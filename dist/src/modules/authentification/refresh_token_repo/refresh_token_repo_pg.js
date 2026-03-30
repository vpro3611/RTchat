"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepoPg = void 0;
const user_database_error_1 = require("../../users/errors/user_database_error");
class RefreshTokenRepoPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    mapToTokenDto(row) {
        return {
            id: row.id,
            userId: row.user_id,
            tokenHash: row.token_hash,
            expiresAt: row.expires_at,
            revokedAt: row.revoked_at,
            createdAt: row.created_at,
        };
    }
    mapError(error) {
        if (error instanceof Error && process.env.NODE_ENV !== "production") {
            throw new user_database_error_1.DatabaseQueryError(`${error.message} - FAILED TO QUERY DATABASE`);
        }
        throw new user_database_error_1.DatabaseQueryError('DATABASE_QUERY_ERROR');
    }
    async create(data) {
        try {
            await this.pool.query('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)', [
                data.id,
                data.userId,
                data.tokenHash,
                data.expiresAt
            ]);
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async findValidByHash(tokenHash) {
        try {
            const result = await this.pool.query("SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1", [tokenHash]);
            const row = result.rows[0];
            return row ? this.mapToTokenDto(row) : null;
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async revoke(id) {
        try {
            await this.pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [id]);
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async revokeByHash(tokenHash) {
        try {
            await this.pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
        }
        catch (error) {
            this.mapError(error);
        }
    }
    async findByHash(tokenHash) {
        try {
            const result = await this.pool.query("SELECT * FROM refresh_tokens WHERE token_hash = $1", [tokenHash]);
            const row = result.rows[0];
            return row ? this.mapToTokenDto(row) : null;
        }
        catch (error) {
            this.mapError(error);
        }
    }
}
exports.RefreshTokenRepoPg = RefreshTokenRepoPg;
