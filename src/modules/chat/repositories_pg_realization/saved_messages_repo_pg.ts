import {SavedMessagesRepoInterface} from "../domain/ports/saved_messages_repo_interface";
import {Pool, PoolClient} from "pg";
import {SavedMessages} from "../domain/saved_messages/saved_messages";
import {mapPgError} from "../../error_mapper/pg_error_mapper";
import {EncryptionPort} from "../../infrasctructure/ports/encryption/encryption_port";


export class SavedMessagesRepoPg implements SavedMessagesRepoInterface {
    constructor(private readonly pool: Pool | PoolClient, private readonly encryptionService: EncryptionPort) {}

    private mapToSavedMessages(row: any): SavedMessages {
        const decryptedContent = this.encryptionService.decrypt(row.content);
        return SavedMessages.restore(
            row.saved_by_user,
            row.message_id,
            row.conversation_id,
            row.sender_id,
            decryptedContent,
            row.created_at,
            row.updated_at,
        )
    }

    async saveMessage(savedMessage: SavedMessages): Promise<void> {
        try {
            const encryptedContent = this.encryptionService.encrypt(savedMessage.getContent());
            const query =
                `INSERT INTO saved_messages
                 (saved_by_user, message_id, conversation_id, sender_id, content, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`;

            await this.pool.query(query, [
                savedMessage.getSavedBy(),
                savedMessage.getMessageId(),
                savedMessage.getConversationId(),
                savedMessage.getSenderId(),
                encryptedContent,
                savedMessage.getCreatedAt(),
                savedMessage.getUpdatedAt(),
            ]);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async getSavedMessages(
        savedById: string,
        limit = 20,
        cursor?: string
    ): Promise<{ items: SavedMessages[]; nextCursor?: string }> {
        try {
            const params: any[] = [savedById];
            let cursorCondition = "";

            if (cursor) {
                const [createdAt, messageId] = cursor.split("|");

                if (!createdAt || !messageId) {
                    throw new Error("Invalid cursor format");
                }

                params.push(createdAt, messageId);

                cursorCondition = `
                AND (sm.created_at, sm.message_id) < ($${params.length - 1}, $${params.length})
                `;
            }

            params.push(limit + 1);

            const result = await this.pool.query(
                `
                    SELECT 
                      sm.saved_by_user,
                      sm.message_id,
                      sm.conversation_id,
                      sm.sender_id,
                      sm.content,
                      sm.created_at,
                      sm.updated_at
                    FROM saved_messages sm
                    WHERE sm.saved_by_user = $1
                      ${cursorCondition}
                    ORDER BY sm.created_at DESC, sm.message_id DESC
                    LIMIT $${params.length}
                  `,
                            params
                        );

            const rows = result.rows;

            let nextCursor: string | undefined;

            if (rows.length > limit) {
                const next = rows.pop();

                nextCursor = `${next.created_at.toISOString()}|${next.message_id}`;
            }

            const items = rows.map(
                (row) =>
                    this.mapToSavedMessages(row)
            );

            return { items, nextCursor };
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async removeSavedMessage(messageId: string, savedById: string): Promise<void> {
        try {
            const query =
                `DELETE FROM saved_messages
                 WHERE message_id = $1 AND saved_by_user = $2`;

            await this.pool.query(query, [messageId, savedById]);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async isSaved(messageId: string, savedById: string): Promise<boolean> {
        try {
            const query =
                `SELECT EXISTS (SELECT 1 FROM saved_messages WHERE message_id = $1 AND saved_by_user = $2) AS exists`;

            const result = await this.pool.query(query, [messageId, savedById]);
            return result.rows[0].exists;
        } catch (error) {
            throw mapPgError(error);
        }

    }

    async getSpecificSavedMessage(messageId:string, savedById:string): Promise<SavedMessages | null> {
        try {
            const query = `
            SELECT * FROM saved_messages where message_id = $1 AND saved_by_user = $2
            `

            const result = await this.pool.query(query, [messageId, savedById]);
            if (!result.rows.length) {
                return null;
            }
            const row = result.rows[0];
            return this.mapToSavedMessages(row);
        } catch (error) {
            throw mapPgError(error);
        }
    }

}