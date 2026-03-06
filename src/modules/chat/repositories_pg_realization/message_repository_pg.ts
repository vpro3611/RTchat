import {MessageRepoInterface} from "../domain/ports/message_repo_interface";
import {Pool, PoolClient} from "pg";
import {Message} from "../domain/message/message";


export class MessageRepositoryPg implements MessageRepoInterface {
    constructor(private readonly pg: Pool | PoolClient) {}

    private mapToMessage(row: any): Message {
        return Message.restore(
            row.id,
            row.conversation_id,
            row.sender_id,
            row.content,
            row.is_edited,
            row.is_deleted,
            row.created_at,
            row.updated_at,
        );
    }

    async create(message: Message): Promise<void> {
        await this.pg.query(
            `
            INSERT INTO messages
            (id, conversation_id, sender_id, content, is_edited, is_deleted, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
                message.id,
                message.getConversationId(),
                message.getSenderId(),
                message.getContent(),
                message.getIsEdited(),
                message.getIsDeleted(),
                message.getCreatedAt(),
                message.getUpdatedAt(),
            ]
        );
    }

    async findById(id: string): Promise<Message | null> {
        const result = await this.pg.query(`SELECT * FROM messages WHERE id = $1`,
            [id]);

        if (!result.rows.length) {
            return null;
        }

        const row = result.rows[0];

        return this.mapToMessage(row);
    }

    async findByConversationId(conversationId: string, limit = 20, cursor?: string): Promise<{items: Message[], nextCursor?: string}> {
        const params: any[] = [conversationId];
        let cursorCondition = "";

        if (cursor) {
            params.push(cursor);
            cursorCondition = `AND created_at > $${params.length}`;
        }

        params.push(limit+1);

        const result = await this.pg.query(
            `
            SELECT * 
            FROM messages
            WHERE conversation_id = $1
            ${cursorCondition}
            ORDER BY created_at DESC
            LIMIT $${params.length}
            `,
            params
        );

        const rows = result.rows;

        let nextCursor: string | undefined;

        if (rows.length > limit) {
            const nextItem = rows.pop();
            nextCursor = nextItem?.created_at.toISOString();
        }

        const items = rows.map(row => this.mapToMessage(row));

        return {items, nextCursor};
    }

    async update(message: Message): Promise<void> {
        await this.pg.query(`UPDATE messages SET content = $1, is_edited = $2, is_deleted = $3, updated_at = $4 WHERE id = $5`,
            [
                message.getContent(),
                message.getIsEdited(),
                message.getIsDeleted(),
                message.getUpdatedAt(),
                message.id,
            ]
        );
    }
}