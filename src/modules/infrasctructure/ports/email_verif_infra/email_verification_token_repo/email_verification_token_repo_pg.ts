import {EmailVerificationInterface} from "../email_verification/email_verification_interface";
import {Pool, PoolClient} from "pg";
import {DatabaseQueryError} from "../../../../users/errors/user_database_error";


export class EmailVerificationTokenRepoPg implements EmailVerificationInterface {
    constructor(private readonly pool: Pool | PoolClient) {}

    async saveToken(token: {id: string, userId: string, tokenHash: string, expiresAt: Date, createdAt: Date, tokenType: string}): Promise<void> {
        try {
            await this.pool.query('INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at, token_type) VALUES ($1, $2, $3, $4, $5, $6)', [
                token.id,
                token.userId,
                token.tokenHash,
                token.expiresAt,
                token.createdAt,
                token.tokenType
            ]);
        } catch (error: any) {
            throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }

    async findByTokenHash(tokenHash: string): Promise<{userId: string, tokenType: string} | null> {
        try {
            const result = await this.pool.query('SELECT user_id, token_type FROM email_verification_tokens WHERE token_hash = $1 AND expires_at > NOW()', [tokenHash]);
            const row = result.rows[0];
            if (!row) {
                return null;
            }
            return {userId: row.user_id, tokenType: row.token_type};
        } catch (error: any) {
            throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }

    async deleteByUserId(userId: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [userId]);
        } catch (error: any) {
            throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }

    async deleteByTokenHash(tokenHash: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM email_verification_tokens WHERE token_hash = $1', [tokenHash]);
        } catch (error: any) {
            throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }

    async deleteByUserIdAndType(userId: string, tokenType: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM email_verification_tokens WHERE user_id = $1 AND token_type = $2', [userId, tokenType]);
        } catch (error: any) {
            throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
        }
    }
}