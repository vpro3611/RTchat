import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("attachment_blobs", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        data: { type: "bytea", notNull: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func('now()') },
    });

    pgm.createTable("message_attachments", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        message_id: { type: "uuid", notNull: true, references: "messages(id)", onDelete: "CASCADE" },
        blob_id: { type: "uuid", notNull: true, references: "attachment_blobs(id)" },
        type: { type: "varchar(20)", notNull: true }, // 'image', 'video', 'file'
        name: { type: "text", notNull: true },
        mime_type: { type: "varchar(100)", notNull: true },
        size: { type: "integer", notNull: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func('now()') },
    });

    pgm.createIndex("message_attachments", ["message_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("message_attachments");
    pgm.dropTable("attachment_blobs");
}
