"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationTokenRepoPg = void 0;
const user_database_error_1 = require("../../../../users/errors/user_database_error");
class EmailVerificationTokenRepoPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async saveToken(token) {
        try {
            await this.pool.query('INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)', [
                token.id,
                token.userId,
                token.tokenHash,
                token.expiresAt,
                token.createdAt
            ]);
        }
        catch (error) {
            throw new user_database_error_1.DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }
    async findByTokenHash(tokenHash) {
        try {
            const result = await this.pool.query('SELECT user_id FROM email_verification_tokens WHERE token_hash = $1 AND expires_at > NOW()', [tokenHash]);
            const row = result.rows[0];
            if (!row) {
                return null;
            }
            return { userId: row.user_id };
        }
        catch (error) {
            throw new user_database_error_1.DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }
    async deleteByUserId(userId) {
        try {
            await this.pool.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [userId]);
        }
        catch (error) {
            throw new user_database_error_1.DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }
}
exports.EmailVerificationTokenRepoPg = EmailVerificationTokenRepoPg;
