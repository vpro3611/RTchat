import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("saved_messages", {
        saved_by_user: {
            type: "uuid",
            notNull: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },
        message_id: {
            type: "uuid",
            primaryKey: true,
        },
        conversation_id: {
            type: "uuid",
            notNull: true,
        },
        sender_id: {
            type: "uuid",
            notNull: true,
        },
        content: {
            type: "text",
            notNull: true,
        },
        created_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
            default: pgm.func('now()'),
        },
        updated_at: {
            type: "TIMESTAMPTZ",
        },

    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("saved_messages");
}
