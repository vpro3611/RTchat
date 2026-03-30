"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepositoryPg = void 0;
const message_1 = require("../domain/message/message");
const pg_error_mapper_1 = require("../../error_mapper/pg_error_mapper");
class MessageRepositoryPg {
    pg;
    constructor(pg) {
        this.pg = pg;
    }
    mapToMessage(row) {
        return message_1.Message.restore(row.id, row.conversation_id, row.sender_id, row.content, row.is_edited, row.is_deleted, row.created_at, row.updated_at);
    }
    async create(message) {
        try {
            await this.pg.query(`
                    INSERT INTO messages
                    (id, conversation_id, sender_id, content, is_edited, is_deleted, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                message.id,
                message.getConversationId(),
                message.getSenderId(),
                message.getContent().getContentValue(),
                message.getIsEdited(),
                message.getIsDeleted(),
                message.getCreatedAt(),
                message.getUpdatedAt(),
            ]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async findById(id) {
        try {
            const result = await this.pg.query(`SELECT *
                                                FROM messages
                                                WHERE id = $1`, [id]);
            if (!result.rows.length) {
                return null;
            }
            const row = result.rows[0];
            return this.mapToMessage(row);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async findByConversationId(conversationId, limit = 20, cursor) {
        try {
            const params = [conversationId];
            let cursorCondition = "";
            let orderBy = "ORDER BY created_at ASC";
            // При первом запросе (без курсора) - получаем последние сообщения (новые)
            // При пагинации (с курсором) - получаем более старые сообщения
            if (cursor) {
                params.push(cursor);
                cursorCondition = `AND created_at < $${params.length}`;
                orderBy = "ORDER BY created_at ASC";
            }
            else {
                orderBy = "ORDER BY created_at DESC";
            }
            params.push(limit + 1);
            const result = await this.pg.query(`
                    SELECT *
                    FROM messages
                    WHERE conversation_id = $1
                        ${cursorCondition}
                    ${orderBy}
                        LIMIT $${params.length}
                `, params);
            const rows = result.rows;
            let nextCursor;
            if (rows.length > limit) {
                const nextItem = rows.pop();
                nextCursor = nextItem?.created_at.toISOString();
            }
            const items = rows.map(row => this.mapToMessage(row));
            // При первом запросе переворачиваем, чтобы старые были сверху
            if (!cursor) {
                items.reverse();
            }
            return { items, nextCursor };
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async update(message) {
        try {
            await this.pg.query(`UPDATE messages
                                 SET content = $1,
                                     is_edited = $2,
                                     is_deleted = $3,
                                     updated_at = $4
                                 WHERE id = $5`, [
                message.getContent().getContentValue(),
                message.getIsEdited(),
                message.getIsDeleted(),
                message.getUpdatedAt(),
                message.id,
            ]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
}
exports.MessageRepositoryPg = MessageRepositoryPg;
