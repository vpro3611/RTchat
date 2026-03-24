import {Pool, PoolClient} from "pg";
import {UserToUserBlocksInterface} from "../ports/user_to_user_blocks_interface";
import {User} from "../domain/user";
import {mapPgError} from "../../error_mapper/pg_error_mapper";


export class UserToUserBlocksPg implements UserToUserBlocksInterface {
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

    async blockSpecificUser(actorId: string, targetId: string): Promise<User> {
        try {
            const query = `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`;
            await this.pool.query(query, [actorId, targetId]);

            // Get user data after blocking
            const userQuery = `SELECT * FROM users WHERE id = $1`;
            const userResult = await this.pool.query(userQuery, [targetId]);
            return this.mapDoDomain(userResult.rows[0]);
        } catch (error: any) {
            throw mapPgError(error);
        }
    }

    async unblockSpecificUser(actorId: string, targetId: string): Promise<User> {
        try {
            const query = `DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`;
            await this.pool.query(query, [actorId, targetId]);

            // Get user data after unblocking
            const userQuery = `SELECT * FROM users WHERE id = $1`;
            const userResult = await this.pool.query(userQuery, [targetId]);
            return this.mapDoDomain(userResult.rows[0]);
        } catch (error: any) {
            throw mapPgError(error);
        }
    }

    async getFullBlacklist(actorId: string): Promise<User[]> {
        try {
            const query = `SELECT u.* FROM user_blocks b 
                           JOIN users u ON b.blocked_id = u.id 
                           WHERE b.blocker_id = $1`;
            return this.pool.query(query, [actorId])
                .then(result => result.rows.map(row => this.mapDoDomain(row)));
        } catch (error: any) {
            throw mapPgError(error);
        }
    }

    async ensureBlockedExists(actorId: string, targetId: string): Promise<boolean> {
        try {
            const query = `SELECT EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2) AS exists`;
            const result = await this.pool.query(query, [actorId, targetId]);
            return result.rows[0].exists;
        } catch (error: any) {
            throw mapPgError(error);
        }
    }

    async ensureAnyBlocksExists(actorId: string, targetId: string): Promise<boolean> {
        try {
            const query = `SELECT EXISTS (SELECT 1
                            FROM user_blocks
                            WHERE (blocker_id = $1 AND blocked_id = $2)
                            OR (blocker_id = $2 AND blocked_id = $1)) AS exists
                        `;
            const result = await this.pool.query(query, [actorId, targetId]);
            return result.rows[0].exists;
        } catch (error: any) {
            throw mapPgError(error);
        }
    }
}