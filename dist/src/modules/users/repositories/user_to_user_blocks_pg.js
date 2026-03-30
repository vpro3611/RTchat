"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserToUserBlocksPg = void 0;
const user_1 = require("../domain/user");
const pg_error_mapper_1 = require("../../error_mapper/pg_error_mapper");
class UserToUserBlocksPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    mapDoDomain(row) {
        return user_1.User.restore(row.id, row.username, row.email, row.password_hash, row.is_active, row.is_verified, row.last_seen_at, row.created_at, row.updated_at);
    }
    async blockSpecificUser(actorId, targetId) {
        try {
            const query = `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`;
            await this.pool.query(query, [actorId, targetId]);
            // Get user data after blocking
            const userQuery = `SELECT * FROM users WHERE id = $1`;
            const userResult = await this.pool.query(userQuery, [targetId]);
            return this.mapDoDomain(userResult.rows[0]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async unblockSpecificUser(actorId, targetId) {
        try {
            const query = `DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`;
            await this.pool.query(query, [actorId, targetId]);
            // Get user data after unblocking
            const userQuery = `SELECT * FROM users WHERE id = $1`;
            const userResult = await this.pool.query(userQuery, [targetId]);
            return this.mapDoDomain(userResult.rows[0]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async getFullBlacklist(actorId) {
        try {
            const query = `SELECT u.* FROM user_blocks b 
                           JOIN users u ON b.blocked_id = u.id 
                           WHERE b.blocker_id = $1`;
            return this.pool.query(query, [actorId])
                .then(result => result.rows.map(row => this.mapDoDomain(row)));
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async ensureBlockedExists(actorId, targetId) {
        try {
            const query = `SELECT EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2) AS exists`;
            const result = await this.pool.query(query, [actorId, targetId]);
            return result.rows[0].exists;
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async ensureAnyBlocksExists(actorId, targetId) {
        try {
            const query = `SELECT EXISTS (SELECT 1
                            FROM user_blocks
                            WHERE (blocker_id = $1 AND blocked_id = $2)
                            OR (blocker_id = $2 AND blocked_id = $1)) AS exists
                        `;
            const result = await this.pool.query(query, [actorId, targetId]);
            return result.rows[0].exists;
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
}
exports.UserToUserBlocksPg = UserToUserBlocksPg;
