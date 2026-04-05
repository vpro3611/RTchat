import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("message_replies", {
        message_id: {
            type: "uuid",
            references: "messages(id)",
            onDelete: "CASCADE",
            primaryKey: true,
        },
        parent_message_id: {
            type: "uuid",
            references: "messages(id)",
            onDelete: "SET NULL", // Keep the reply even if parent is deleted
            notNull: true,
        },
        parent_content_snippet: {
            type: "text",
            notNull: true,
        },
        parent_sender_id: {
            type: "uuid",
            references: "users(id)",
            notNull: true,
        },
        conversation_id: {
            type: "uuid",
            references: "conversations(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
        replied_by: {
            type: "uuid",
            references: "users(id)",
            onDelete: "CASCADE",
            notNull: true,
        },
        replied_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
            default: pgm.func('now()'),
        }
    });
    
    pgm.createIndex("message_replies", ["parent_message_id"]);
    pgm.createIndex("message_replies", ["conversation_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("message_replies");
}
