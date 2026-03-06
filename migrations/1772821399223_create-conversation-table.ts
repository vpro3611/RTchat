import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';


export const shorthands: ColumnDefinitions | undefined = undefined;


export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createType("conversation_type", ["direct", "group"]);
    pgm.createTable("conversations", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        conversation_type: {
            type: "conversation_type",
            notNull: true,
        },
        title: {
            type: "text",
            notNull: true,
        },
        created_by: {
            type: "uuid",
            notNull: true,
            references: "users(id)",
        },
        created_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
            default: pgm.func('now()'),
        },
    })
}


export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropType("conversation_type");
    pgm.dropTable("conversations");
}
