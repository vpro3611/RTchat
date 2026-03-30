import {RefreshTokenRepoInterface} from "../ports/refresh_token_repo_interface";
import {Pool, PoolClient} from "pg";
import {DatabaseQueryError} from "../../users/errors/user_database_error";
import {TokenDto} from "../DTO/token_dto";


export class RefreshTokenRepoPg implements RefreshTokenRepoInterface {
    constructor(private readonly pool: Pool | PoolClient ) {}


    private mapToTokenDto(row: any): any {
        return {
            id: row.id,
            userId: row.user_id,
            tokenHash: row.token_hash,
            expiresAt: row.expires_at,
            revokedAt: row.revoked_at,
            createdAt: row.created_at,
        };
    }

    private mapError(error: unknown): never {
        if (error instanceof Error && process.env.NODE_ENV !== "production") {
            throw new DatabaseQueryError(`${error.message} - FAILED TO QUERY DATABASE`);
        }
        throw new DatabaseQueryError('DATABASE_QUERY_ERROR');
    }

    async create(data: {id: string, userId: string, tokenHash: string, expiresAt: Date}): Promise<void> {
        try {
            await this.pool.query('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
                [
                    data.id,
                    data.userId,
                    data.tokenHash,
                    data.expiresAt
                ]);
        } catch (error) {
            this.mapError(error);
        }
    }

    async findValidByHash(tokenHash: string): Promise<TokenDto | null> {
        try {
            const result = await this.pool.query(
                "SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1",
                [tokenHash]);

            const row = result.rows[0];

            return row ? this.mapToTokenDto(row) : null;
        } catch (error) {
            this.mapError(error);
        }
    }

    async revoke(id: string) : Promise<void> {
        try {
            await this.pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [id]);
        } catch (error) {
            this.mapError(error);
        }
    }

    async revokeByHash(tokenHash: string) : Promise<void> {
        try {
            await this.pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
        } catch (error) {
            this.mapError(error);
        }
    }

    async findByHash(tokenHash: string): Promise<TokenDto | null> {
        try {
            const result = await this.pool.query(
                "SELECT * FROM refresh_tokens WHERE token_hash = $1",
                [tokenHash]);
            const row = result.rows[0];
            return row ? this.mapToTokenDto(row) : null;
        } catch (error) {
            this.mapError(error);
        }
    }
}