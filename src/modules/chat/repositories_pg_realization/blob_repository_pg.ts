import { Pool, PoolClient } from "pg";
import { mapPgError } from "../../error_mapper/pg_error_mapper";

export class BlobRepositoryPg {
    constructor(private readonly pool: Pool | PoolClient) {}

    async save(buffer: Buffer): Promise<string> {
        try {
            const result = await this.pool.query(
                "INSERT INTO attachment_blobs (data) VALUES ($1) RETURNING id",
                [buffer]
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
            return result.rows.length > 0 ? result.rows[0].data : null;
        } catch (error) {
            throw mapPgError(error);
        }
    }
}
