"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRequestsRepositoryPg = void 0;
const conversation_requests_1 = require("../domain/conversation_requests/conversation_requests");
const pg_error_mapper_1 = require("../../error_mapper/pg_error_mapper");
class ConversationRequestsRepositoryPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    mapToDomain(row) {
        return conversation_requests_1.ConversationRequests.restore(row.id, row.conversation_id, row.user_id, row.status, row.request_message, row.submitted_at, row.reviewed_at, row.reviewed_by, row.review_message, row.is_deleted);
    }
    async create(convReq) {
        try {
            const query = `INSERT INTO conversation_join_requests
                (id, conversation_id, user_id, status, request_message, submitted_at, reviewed_at, reviewed_by, review_message, is_deleted)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `;
            const result = await this.pool.query(query, [
                convReq.id,
                convReq.getConversationId(),
                convReq.getUserId(),
                convReq.getStatus(),
                convReq.getRequestMessage(),
                convReq.getSubmittedAt(),
                convReq.getReviewedAt(),
                convReq.getReviewedBy(),
                convReq.getReviewedMessage(),
                convReq.getIsDeleted(),
            ]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async getRequests(conversationId, status) {
        try {
            let query;
            if (status) {
                query =
                    `SELECT * FROM conversation_join_requests WHERE conversation_id = $1 AND status = $2`;
            }
            else {
                query =
                    `SELECT * FROM conversation_join_requests WHERE conversation_id = $1`;
            }
            const params = status ? [conversationId, status] : [conversationId];
            const result = await this.pool.query(query, params);
            return result.rows.map(r => this.mapToDomain(r));
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async getSpecificRequest(requestId, conversationId) {
        try {
            const query = `SELECT * FROM conversation_join_requests WHERE id = $1 AND conversation_id = $2`;
            const result = await this.pool.query(query, [requestId, conversationId]);
            if (!result.rows.length) {
                return null;
            }
            const row = result.rows[0];
            return this.mapToDomain(row);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async getRequestById(requestId) {
        try {
            const query = `SELECT * FROM conversation_join_requests WHERE id = $1`;
            const result = await this.pool.query(query, [requestId]);
            if (!result.rows.length) {
                return null;
            }
            const row = result.rows[0];
            return this.mapToDomain(row);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async getUsersRequests(userId, status) {
        try {
            let query;
            if (status) {
                query =
                    `SELECT * FROM conversation_join_requests WHERE user_id = $1 AND status = $2`;
            }
            else {
                query =
                    `SELECT * FROM conversation_join_requests WHERE user_id = $1`;
            }
            const params = status ? [userId, status] : [userId];
            const result = await this.pool.query(query, params);
            return result.rows.map(r => this.mapToDomain(r));
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async updateRequest(requestId, conversationId, status, reviewMessage) {
        try {
            const query = `UPDATE 
                conversation_join_requests SET status = $1, reviewed_at = NOW(), review_message = $2 
                WHERE id = $3 AND conversation_id = $4 AND status = 'pending'
                RETURNING *
                `;
            const result = await this.pool.query(query, [
                status,
                reviewMessage,
                requestId,
                conversationId,
            ]);
            const row = result.rows[0];
            return this.mapToDomain(row);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async removeRequest(requestId) {
        try {
            const query = `UPDATE conversation_join_requests SET is_deleted = true WHERE id = $1`;
            await this.pool.query(query, [requestId]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
}
exports.ConversationRequestsRepositoryPg = ConversationRequestsRepositoryPg;
