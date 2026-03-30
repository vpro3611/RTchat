"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationBansRepositoryPg = void 0;
const pg_error_mapper_1 = require("../../error_mapper/pg_error_mapper");
class ConversationBansRepositoryPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    mapToType(row) {
        return {
            conversationId: row.conversation_id,
            userId: row.user_id,
            bannedBy: row.banned_by,
            createdAt: row.created_at,
            reason: row.reason,
        };
    }
    async isBanned(conversationId, userId) {
        // Handle edge cases - return false for empty/null inputs
        if (!conversationId || !userId) {
            return false;
        }
        // Basic UUID format validation - return false for invalid formats
        // Valid UUID: 8-4-4-4-12 hex digits with hyphens
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(conversationId) || !uuidRegex.test(userId)) {
            return false;
        }
        // SELECT EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2) AS exists
        try {
            const query = `SELECT EXISTS (SELECT 1
                                          FROM conversation_bans
                                          WHERE conversation_id = $1 AND user_id = $2) AS exists`;
            const result = await this.pool.query(query, [conversationId, userId]);
            return result.rows[0].exists;
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async ban(convBan) {
        try {
            const query = `INSERT INTO conversation_bans (conversation_id, user_id, banned_by, created_at, reason) VALUES ($1, $2, $3, $4, $5)`;
            const result = await this.pool.query(query, [
                convBan.conversationId,
                convBan.userId,
                convBan.bannedBy,
                convBan.createdAt,
                convBan.reason,
            ]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async unban(conversationId, userId) {
        try {
            const query = `DELETE FROM conversation_bans WHERE conversation_id = $1 AND user_id = $2`;
            const result = await this.pool.query(query, [conversationId, userId]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async getBannedUsers(conversationId) {
        try {
            const query = `SELECT * FROM conversation_bans WHERE conversation_id = $1`;
            const result = await this.pool.query(query, [conversationId]);
            const row = result.rows;
            return row.map(r => this.mapToType(r));
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
}
exports.ConversationBansRepositoryPg = ConversationBansRepositoryPg;
