import { Pool, PoolClient } from "pg";
import { Avatar } from "../domain/avatar/avatar";
import { AvatarRepoInterface } from "../domain/ports/avatar_repo_interface";
import { mapPgError } from "../../error_mapper/pg_error_mapper";

export class AvatarRepositoryPg implements AvatarRepoInterface {
    constructor(private readonly pool: Pool | PoolClient) {}

    async save(avatar: Avatar): Promise<string> {
        const query = "INSERT INTO avatars (data, mime_type) VALUES ($1, $2) RETURNING id";
        try {
            const result = await this.pool.query(query, [avatar.getData(), avatar.getMimeType()]);
            return result.rows[0].id;
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async findById(id: string): Promise<Avatar | null> {
        const query = "SELECT * FROM avatars WHERE id = $1";
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) return null;
            const row = result.rows[0];
            return Avatar.restore(row.id, row.data, row.mime_type, row.created_at);
        } catch (error) {
            throw mapPgError(error);
        }
    }

    async delete(id: string): Promise<void> {
        const query = "DELETE FROM avatars WHERE id = $1";
        try {
            await this.pool.query(query, [id]);
        } catch (error) {
            throw mapPgError(error);
        }
    }
}
