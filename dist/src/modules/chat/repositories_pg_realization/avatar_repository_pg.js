"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarRepositoryPg = void 0;
const avatar_1 = require("../domain/avatar/avatar");
const pg_error_mapper_1 = require("../../error_mapper/pg_error_mapper");
class AvatarRepositoryPg {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async save(avatar) {
        const query = "INSERT INTO avatars (data, mime_type) VALUES ($1, $2) RETURNING id";
        try {
            const result = await this.pool.query(query, [avatar.getData(), avatar.getMimeType()]);
            return result.rows[0].id;
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async findById(id) {
        const query = "SELECT * FROM avatars WHERE id = $1";
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0)
                return null;
            const row = result.rows[0];
            return avatar_1.Avatar.restore(row.id, row.data, row.mime_type, row.created_at);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
    async delete(id) {
        const query = "DELETE FROM avatars WHERE id = $1";
        try {
            await this.pool.query(query, [id]);
        }
        catch (error) {
            throw (0, pg_error_mapper_1.mapPgError)(error);
        }
    }
}
exports.AvatarRepositoryPg = AvatarRepositoryPg;
