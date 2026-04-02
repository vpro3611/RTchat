import {MessageRepoInterface} from "../domain/ports/message_repo_interface";
import {Pool, PoolClient} from "pg";
import {Message} from "../domain/message/message";
import {mapPgError} from "../../error_mapper/pg_error_mapper";
import {AttachmentRepositoryPg} from "./attachment_repository_pg";


export class MessageRepositoryPg implements MessageRepoInterface {
    private readonly attachmentRepo: AttachmentRepositoryPg;
    constructor(private readonly pg: Pool | PoolClient) {
        this.attachmentRepo = new AttachmentRepositoryPg(pg);
    }

    private mapToMessage(row: any, attachments: any[] = []): Message {
        return Message.restore(
            row.id,
            row.conversation_id,
            row.sender_id,
            row.content,
            row.is_edited,
            row.is_deleted,
            row.created_at,
            row.updated_at,
            row.original_sender_id,
            row.is_resent,
            attachments,
        );
    }

    async create(message: Message): Promise<void> {
        try {
            await this.pg.query(
                `
                    INSERT INTO messages
                    (id, conversation_id, sender_id, content, is_edited, is_deleted, created_at, updated_at, original_sender_id, is_resent)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `,
                [
                    message.id,
                    message.getConversationId(),
                    message.getSenderId(),
                    message.getContent().getContentValue(),
                    message.getIsEdited(),
                    message.getIsDeleted(),
                    message.getCreatedAt(),
                    message.getUpdatedAt(),
                    message.getOriginalSenderId(),
                    message.getIsResent(),
                ]
            );

            for (const attachment of message.getAttachments()) {
                await this.attachmentRepo.save(message.id, attachment);
            }
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findById(id: string): Promise<Message | null> {
        try {
            const result = await this.pg.query(`SELECT *
                                                FROM messages
                                                WHERE id = $1`,
                [id]);

            if (!result.rows.length) {
                return null;
            }

            const row = result.rows[0];
            const attachments = await this.attachmentRepo.findByMessageId(id);

            return this.mapToMessage(row, attachments);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findByConversationId(conversationId: string, limit = 20, cursor?: string): Promise<{items: Message[], nextCursor?: string}> {
        try {
            const params: any[] = [conversationId];
            let cursorCondition = "";
            let orderBy = "ORDER BY created_at ASC";

            if (cursor) {
                params.push(cursor);
                cursorCondition = `AND created_at < $${params.length}`;
                orderBy = "ORDER BY created_at ASC";
            } else {
                orderBy = "ORDER BY created_at DESC";
            }

            params.push(limit + 1);

            const result = await this.pg.query(
                `
                    SELECT *
                    FROM messages
                    WHERE conversation_id = $1
                        ${cursorCondition}
                    ${orderBy}
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

            const items = await Promise.all(rows.map(async row => {
                const attachments = await this.attachmentRepo.findByMessageId(row.id);
                return this.mapToMessage(row, attachments);
            }));

            if (!cursor) {
                items.reverse();
            }

            return {items, nextCursor};
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async update(message: Message): Promise<void> {
        try {
            await this.pg.query(`UPDATE messages
                                 SET content = $1,
                                     is_edited = $2,
                                     is_deleted = $3,
                                     updated_at = $4
                                 WHERE id = $5`,
                [
                    message.getContent().getContentValue(),
                    message.getIsEdited(),
                    message.getIsDeleted(),
                    message.getUpdatedAt(),
                    message.id,
                ]
            );
        } catch (error) {
            throw mapPgError(error);
        }
    }
}