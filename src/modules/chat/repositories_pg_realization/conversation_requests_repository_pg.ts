import {Pool, PoolClient} from "pg";
import {ConversationRequestsInterface} from "../domain/ports/conversation_requests_interface";
import {ConversationReqStatus, ConversationRequests} from "../domain/conversation_requests/conversation_requests";
import {mapPgError} from "../../error_mapper/pg_error_mapper";
import {EncryptionPort} from "../../infrasctructure/ports/encryption/encryption_port";


export class ConversationRequestsRepositoryPg implements ConversationRequestsInterface {
    constructor(private readonly pool: Pool | PoolClient, private readonly encryptionService: EncryptionPort) {}

    private mapToDomain(row: any): ConversationRequests {
        const decryptedRequestMessage = this.encryptionService.decrypt(row.request_message);
        let decryptedReviewMessage = row.review_message;
        if (decryptedReviewMessage) {
            try {
                decryptedReviewMessage = this.encryptionService.decrypt(decryptedReviewMessage);
            } catch (e) {
                // Fallback
            }
        }
        return ConversationRequests.restore(
            row.id,
            row.conversation_id,
            row.user_id,
            row.status,
            decryptedRequestMessage,
            row.submitted_at,
            row.reviewed_at,
            row.reviewed_by,
            decryptedReviewMessage,
            row.is_deleted,
        )
    }

    async create(convReq: ConversationRequests): Promise<void> {
        try {
            const encryptedRequestMessage = this.encryptionService.encrypt(convReq.getRequestMessage());
            const query =
                `INSERT INTO conversation_join_requests
                (id, conversation_id, user_id, status, request_message, submitted_at, reviewed_at, reviewed_by, review_message, is_deleted)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `;

            await this.pool.query(query, [
                convReq.id,
                convReq.getConversationId(),
                convReq.getUserId(),
                convReq.getStatus(),
                encryptedRequestMessage,
                convReq.getSubmittedAt(),
                convReq.getReviewedAt(),
                convReq.getReviewedBy(),
                null, // review_message is null on create
                convReq.getIsDeleted(),
            ])
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async getRequests(conversationId: string, status?: string): Promise<ConversationRequests[]> {
        try {
            let query;
            if (status) {
                 query =
                    `SELECT * FROM conversation_join_requests WHERE conversation_id = $1 AND status = $2`;
            } else {
                query =
                    `SELECT * FROM conversation_join_requests WHERE conversation_id = $1`;
            }

            const params = status ? [conversationId, status] : [conversationId];
            const result = await this.pool.query(query, params);
            return result.rows.map(r => this.mapToDomain(r));
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async getSpecificRequest(requestId: string, conversationId: string): Promise<ConversationRequests | null> {
        try {
            const query =
                `SELECT * FROM conversation_join_requests WHERE id = $1 AND conversation_id = $2`;

            const result = await this.pool.query(query, [requestId, conversationId]);

            if (!result.rows.length) {
                return null;
            }

            const row = result.rows[0];
            return this.mapToDomain(row);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async getRequestById(requestId: string): Promise<ConversationRequests | null> {
        try {
            const query =
                `SELECT * FROM conversation_join_requests WHERE id = $1`;

            const result = await this.pool.query(query, [requestId]);

            if (!result.rows.length) {
                return null;
            }

            const row = result.rows[0];
            return this.mapToDomain(row);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async getUsersRequests(userId: string, status?: string): Promise<ConversationRequests[]> {
        try {
            let query;
            if (status) {
                query =
                    `SELECT * FROM conversation_join_requests WHERE user_id = $1 AND status = $2`;
            } else {
                query =
                    `SELECT * FROM conversation_join_requests WHERE user_id = $1`;
            }
            const params = status ? [userId, status] : [userId];
            const result = await this.pool.query(query, params);
            return result.rows.map(r => this.mapToDomain(r));
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async updateRequest(requestId: string, conversationId: string, status: string, reviewMessage: string): Promise<ConversationRequests> {
        try {
            const encryptedReviewMessage = this.encryptionService.encrypt(reviewMessage);
            const query =
                `UPDATE 
                conversation_join_requests SET status = $1, reviewed_at = NOW(), review_message = $2 
                WHERE id = $3 AND conversation_id = $4 AND status = 'pending'
                RETURNING *
                `;

            const result = await this.pool.query(query, [
                status,
                encryptedReviewMessage,
                requestId,
                conversationId,
            ])

            const row = result.rows[0];
            return this.mapToDomain(row);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async removeRequest(requestId: string): Promise<void> {
        try {
            const query =
                `UPDATE conversation_join_requests SET is_deleted = true WHERE id = $1`;

            await this.pool.query(query, [requestId]);
        } catch (error) {
            throw mapPgError(error);
        }
    }
}