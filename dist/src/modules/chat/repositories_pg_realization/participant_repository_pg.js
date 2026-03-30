"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantRepositoryPg = void 0;
const participant_1 = require("../domain/participant/participant");
const pg_error_mapper_1 = require("../../error_mapper/pg_error_mapper");
class ParticipantRepositoryPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    mapToParticipant(row) {
        return participant_1.Participant.restore(row.conversation_id, row.user_id, row.role, row.can_send_messages, row.muted_until, row.joined_at);
    }
    mapToJoined(row) {
        return {
            conversationId: row.conversation_id,
            userId: row.user_id,
            avatarId: row.avatar_id,
            role: row.role,
            canSendMessages: row.can_send_messages,
            mutedUntil: row.muted_until,
            joinedAt: row.joined_at,
            username: row.username,
            email: row.email,
            isActive: row.is_active,
            lastSeenAt: row.last_seen_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async save(participant) {
        try {
            await this.pool.query(`
                    INSERT INTO conversation_participants
                    (conversation_id, user_id, role, can_send_messages, muted_until, joined_at)
                    VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (conversation_id, user_id) 
                    DO UPDATE SET
                        role = EXCLUDED.role,
                        can_send_messages = EXCLUDED.can_send_messages,
                        muted_until = EXCLUDED.muted_until
                `, [
                participant.getConversationId(),
                participant.userId,
                participant.getRole(),
                participant.getCanSendMessages(),
                participant.getMutedUntil(),
                participant.getJoinedAt(),
            ]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async remove(conversationId, userId) {
        try {
            await this.pool.query(`DELETE
                                   FROM conversation_participants
                                   WHERE conversation_id = $1
                                     AND user_id = $2`, [conversationId, userId]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async findParticipant(conversationId, userId) {
        try {
            const result = await this.pool.query(`
                    SELECT *
                    FROM conversation_participants
                    WHERE conversation_id = $1
                      AND user_id = $2
                `, [conversationId, userId]);
            if (!result.rows.length) {
                return null;
            }
            const row = result.rows[0];
            return this.mapToParticipant(row);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async exists(conversationId, userId) {
        try {
            const result = await this.pool.query(`
                    SELECT 1
                    FROM conversation_participants
                    WHERE conversation_id = $1
                      AND user_id = $2
                `, [conversationId, userId]);
            return result.rows.length > 0;
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async getParticipants(conversationId, limit = 20, cursor) {
        try {
            const params = [conversationId];
            let cursorCondition = "";
            if (cursor) {
                params.push(cursor);
                cursorCondition = `AND p.joined_at < $${params.length}`;
            }
            params.push(limit + 1);
            const result = await this.pool.query(`
                    SELECT p.*, u.username, u.email, u.avatar_id
                    FROM conversation_participants p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.conversation_id = $1
                        ${cursorCondition}
                    ORDER BY u.username ASC
                        LIMIT $${params.length}
                `, params);
            const rows = result.rows;
            let nextCursor;
            if (rows.length > limit) {
                const next = rows.pop();
                nextCursor = next?.joined_at.toISOString();
            }
            const items = rows.map(row => this.mapToParticipantListDto(row));
            return { items, nextCursor };
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    mapToParticipantListDto(row) {
        return {
            conversationId: row.conversation_id,
            userId: row.user_id,
            username: row.username,
            email: row.email,
            avatarId: row.avatar_id,
            role: row.role,
            canSendMessages: row.can_send_messages,
            mutedUntil: row.muted_until,
            joinedAt: row.joined_at,
        };
    }
    async getSpecificParticipant(conversationId, participantId) {
        try {
            const query = `
            SELECT p.*, u.username, u.email, u.is_active, u.last_seen_at, u.created_at, u.updated_at, u.avatar_id 
            FROM conversation_participants p 
            JOIN users u ON p.user_id = u.id
            WHERE p.conversation_id = $1 AND p.user_id = $2
            `;
            const result = await this.pool.query(query, [conversationId, participantId]);
            if (!result.rows.length) {
                return null;
            }
            const row = result.rows[0];
            return this.mapToJoined(row);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
}
exports.ParticipantRepositoryPg = ParticipantRepositoryPg;
