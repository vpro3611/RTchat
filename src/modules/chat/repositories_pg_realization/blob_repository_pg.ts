import { Pool, PoolClient } from "pg";
import { mapPgError } from "../../error_mapper/pg_error_mapper";
import {EncryptionPort} from "../../infrasctructure/ports/encryption/encryption_port";

export class BlobRepositoryPg {
    constructor(private readonly pool: Pool | PoolClient, private readonly encryptionService: EncryptionPort) {}

    async save(buffer: Buffer): Promise<string> {
        try {
            const encryptedBuffer = this.encryptionService.encryptToBuffer(buffer);
            const result = await this.pool.query(
                "INSERT INTO attachment_blobs (data) VALUES ($1) RETURNING id",
                [encryptedBuffer]
            );
            return result.rows[0].id;
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async getById(id: string): Promise<Buffer | null> {
        try {
            const result = await this.pool.query(
                "SELECT data FROM attachment_blobs WHERE id = $1",
                [id]
            );
            if (result.rows.length === 0) return null;
            return this.encryptionService.decryptFromBuffer(result.rows[0].data);
        } catch (error) {
            throw mapPgError(error);
        }
    }
}
