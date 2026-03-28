import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("avatars", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        data: { type: "bytea", notNull: true },
        mime_type: { type: "varchar(50)", notNull: true },
        created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") }
    });

    pgm.addColumn("users", {
        avatar_id: { type: "uuid", references: "avatars", onDelete: "SET NULL" }
    });

    pgm.addColumn("conversations", {
        avatar_id: { type: "uuid", references: "avatars", onDelete: "SET NULL" }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn("conversations", "avatar_id");
    pgm.dropColumn("users", "avatar_id");
    pgm.dropTable("avatars");
}
