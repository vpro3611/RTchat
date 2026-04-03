import { Pool, PoolClient } from "pg";
import { Attachment, AttachmentType } from "../domain/message/attachment";
import { mapPgError } from "../../error_mapper/pg_error_mapper";
import {EncryptionPort} from "../../infrasctructure/ports/encryption/encryption_port";

export class AttachmentRepositoryPg {
    constructor(private readonly pool: Pool | PoolClient, private readonly encryptionService: EncryptionPort) {}

    async save(messageId: string, attachment: Attachment): Promise<void> {
        try {
            const encryptedName = this.encryptionService.encrypt(attachment.name);
            await this.pool.query(
                "INSERT INTO message_attachments (id, message_id, blob_id, type, name, mime_type, size, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [attachment.id, messageId, attachment.blobId, attachment.type, encryptedName, attachment.mimeType, attachment.size, attachment.createdAt]
            );
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findByMessageId(messageId: string): Promise<Attachment[]> {
        try {
            const result = await this.pool.query(
                "SELECT * FROM message_attachments WHERE message_id = $1",
                [messageId]
            );
            return result.rows.map(row => {
                const decryptedName = this.encryptionService.decrypt(row.name);
                return Attachment.restore(row.id, row.blob_id, row.type as AttachmentType, decryptedName, row.mime_type, row.size, row.created_at);
            });
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findByBlobId(blobId: string): Promise<Attachment | null> {
        try {
            const result = await this.pool.query(
                "SELECT * FROM message_attachments WHERE blob_id = $1 LIMIT 1",
                [blobId]
            );
            if (result.rows.length === 0) return null;
            const row = result.rows[0];
            const decryptedName = this.encryptionService.decrypt(row.name);
            return Attachment.restore(row.id, row.blob_id, row.type as AttachmentType, decryptedName, row.mime_type, row.size, row.created_at);
        } catch (error) {
            throw mapPgError(error);
        }
    }
}
