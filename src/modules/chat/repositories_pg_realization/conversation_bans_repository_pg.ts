import {ConversationBansInterface} from "../domain/ports/conversation_bans_interface";
import {Pool, PoolClient} from "pg";
import {mapPgError} from "../../error_mapper/pg_error_mapper";
import {ConversationBans} from "../domain/conversation_bans/conversation_bans";


export class ConversationBansRepositoryPg implements ConversationBansInterface {
    constructor(private readonly pool: Pool | PoolClient) {}

    private mapToType(row: any): ConversationBans {
        return {
            conversationId: row.conversation_id,
            userId: row.user_id,
            bannedBy: row.banned_by,
            createdAt: row.created_at,
            reason: row.reason,
        }
    }

    async isBanned(conversationId: string, userId: string): Promise<boolean> {
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
        } catch (error) {
            throw mapPgError(error)
        }
    }

    async ban(convBan: ConversationBans): Promise<void> {
        try {
            const query = `INSERT INTO conversation_bans (conversation_id, user_id, banned_by, created_at, reason) VALUES ($1, $2, $3, $4, $5)`;
            const result = await this.pool.query(query, [
                convBan.conversationId,
                convBan.userId,
                convBan.bannedBy,
                convBan.createdAt,
                convBan.reason,
            ])
        } catch (error) {
            throw mapPgError(error)
        }
    }

    async unban(conversationId: string, userId: string): Promise<void> {
        try {
            const query = `DELETE FROM conversation_bans WHERE conversation_id = $1 AND user_id = $2`;
            const result = await this.pool.query(query, [conversationId, userId]);
        } catch (error) {
            throw mapPgError(error)
        }
    }

    async getBannedUsers(conversationId: string): Promise<ConversationBans[]> {
        try {
            const query = `SELECT * FROM conversation_bans WHERE conversation_id = $1`;
            const result = await this.pool.query(query, [conversationId]);
            const row = result.rows;
            return row.map(r => this.mapToType(r));
        } catch (error) {
            throw mapPgError(error)
        }
    }
}