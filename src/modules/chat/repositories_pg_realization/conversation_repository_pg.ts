import {Pool, PoolClient} from "pg";
import {ConversationRepoInterface} from "../domain/ports/conversation_repo_interface";
import {Conversation} from "../domain/conversation/conversation";
import {mapPgError} from "../../error_mapper/pg_error_mapper";


export class ConversationRepositoryPg implements ConversationRepoInterface {
    constructor(private readonly pool: Pool | PoolClient) {}

    private mapToConversation(row: any): Conversation {
        return Conversation.restore(
            row.id,
            row.conversation_type,
            row.title,
            row.created_by,
            row.created_at,
            row.last_message_at,
            row.user_low,
            row.user_high,
        );
    }

    async create(conversation: Conversation): Promise<void> {
        try {
            await this.pool.query(`INSERT INTO conversations (id, conversation_type, title, created_by, created_at,
                                                              last_message_at, user_low, user_high)
                                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    conversation.id,
                    conversation.getConversationType(),
                    conversation.getTitle().getValue(),
                    conversation.getCreatedBy(),
                    conversation.getCreatedAt(),
                    conversation.getLastMessageAt(),
                    conversation.getUserLow(),
                    conversation.getUserHigh(),
                ]);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async update(conversation: Conversation): Promise<void> {
        try {
            await this.pool.query(`UPDATE conversations
                                   SET title = $1
                                   WHERE id = $2`,
                [
                    conversation.getTitle().getValue(),
                    conversation.id,
                ]);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findById(id: string): Promise<Conversation | null> {
        try {
            const result = await this.pool.query(`SELECT *
                                                  FROM conversations
                                                  WHERE id = $1`, [id]);

            if (!result.rows.length) {
                return null;
            }

            const row = result.rows[0];

            return this.mapToConversation(row);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findDirectConversation(userA: string, userB: string): Promise<Conversation | null> {
        try {
            const [userLow, userHigh] =
                userA < userB ? [userA, userB] : [userB, userA];

            const result = await this.pool.query(`
                        SELECT *
                        FROM conversations
                        WHERE conversation_type = 'direct'
                          AND user_low = $1
                          AND user_high = $2
                `,
                [userLow, userHigh]);

            if (!result.rows.length) {
                return null;
            }

            const row = result.rows[0];

            return this.mapToConversation(row);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async getUserConversations(userId: string, limit= 20, cursor?: string): Promise<{items: Conversation[], nextCursor?: string}> {
        try {
            const params: any[] = [userId];
            let cursorCondition = "";

            if (cursor) {
                params.push(cursor);
                cursorCondition = `AND COALESCE(c.last_message_at, c.created_at) < $${params.length}`;
            }

            params.push(limit + 1);

            const result = await this.pool.query(
                `
                    SELECT c.*
                    FROM conversations c
                             JOIN conversation_participants p
                                  ON p.conversation_id = c.id
                    WHERE p.user_id = $1
                        ${cursorCondition}
                    ORDER BY COALESCE (c.last_message_at, c.created_at) DESC
                        LIMIT $${params.length}
                `,
                params
            );
            const rows = result.rows;

            let nextCursor: string | undefined = undefined;

            if (rows.length > limit) {
                const nextItem = rows.pop();
                nextCursor = (
                    nextItem.last_message_at ?? nextItem.created_at
                ).toISOString();
            }

            const items = rows.map(row => this.mapToConversation(row));

            return {items, nextCursor};
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async updateLastMessage(conversationId: string, date: Date): Promise<void> {
        try {
            await this.pool.query(`UPDATE conversations
                                   SET last_message_at = $1
                                   WHERE id = $2`,
                [date, conversationId]);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async markRead(conversationId: string, userId: string, messageId: string) {
        try {
            await this.pool.query(
                `
                INSERT INTO conversation_reads
                (conversation_id, user_id, last_read_message_id, read_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (conversation_id, user_id)
                DO UPDATE SET 
                    last_read_message_id = EXCLUDED.last_read_message_id,
                    read_at = EXCLUDED.read_at
                `,
                [conversationId, userId, messageId]
            )
        } catch (error) {
            throw mapPgError(error);
        }
    }

}