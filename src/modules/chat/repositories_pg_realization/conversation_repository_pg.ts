import {Pool, PoolClient} from "pg";
import {ConversationRepoInterface} from "../domain/ports/conversation_repo_interface";
import {Conversation} from "../domain/conversation/conversation";


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
        await this.pool.query(`INSERT INTO conversations (id, conversation_type, title, created_by, created_at, last_message_at, user_low, user_high) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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
    }

    async update(conversation: Conversation): Promise<void> {
        await this.pool.query(`UPDATE conversations SET title = $1 WHERE id = $2`,
            [
                conversation.getTitle().getValue(),
                conversation.id,
            ]);
    }

    async findById(id: string): Promise<Conversation | null> {
        const result = await this.pool.query(`SELECT * FROM conversations WHERE id = $1`, [id]);

        if (!result.rows.length) {
            return null;
        }

        const row = result.rows[0];

        return this.mapToConversation(row);
    }

    async findDirectConversation(userA: string, userB: string): Promise<Conversation | null> {
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
    }

    async getUserConversations(userId: string, limit= 20, cursor?: string): Promise<{items: Conversation[], nextCursor?: string}> {
        const params: any[] = [userId];
        let cursorCondition = "";

        if (cursor) {
            params.push(cursor);
            cursorCondition = `AND COALESCE(c.last_message_at, c.created_at) < $${params.length}`;
        }

        params.push(limit+1);

        const result = await this.pool.query(
            `
            SELECT c.*
            FROM conversations c
            JOIN conversation_participants p
            ON p.conversation_id = c.id
            WHERE p.user_id = $1
            ${cursorCondition}
            ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
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
    }

    async updateLastMessage(conversationId: string, date: Date): Promise<void> {
        await this.pool.query(`UPDATE conversations SET last_message_at = $1 WHERE id = $2`,
            [date, conversationId]);
    }

}