import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';


export const shorthands: ColumnDefinitions | undefined = undefined;


export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("messages", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        conversation_id: {
            type: "uuid",
            notNull: true,
            references: "conversations(id)",
            onDelete: "CASCADE",
        },
        sender_id: {
            type: "uuid",
            notNull: true,
            references: "users(id)",
        },
        content: {
            type: "text",
            notNull: true,
        },
        is_edited: {
            type: "boolean",
            notNull: true,
            default: false,
        },
        is_deleted: {
            type: "boolean",
            notNull: true,
            default: false,
        },
        created_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
            default: pgm.func('now()'),
        },
        updated_at: {
            type: "TIMESTAMPTZ",
        }


    })
    pgm.createIndex("messages", ["conversation_id"], {
        name: "idx_messages_conversation"
    });
    pgm.createIndex("messages", ["created_at"], {
        name: "idx_messages_created_at"
    });
}


export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("messages", "idx_messages_created_at");
    pgm.dropIndex("messages", "idx_messages_conversation");
    pgm.dropTable("messages");
}
