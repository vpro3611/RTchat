import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';


export const shorthands: ColumnDefinitions | undefined = undefined;


export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("conversation_participants", {
        conversation_id: {
            type: "uuid",
            notNull: true,
            references: "conversations(id)",
            onDelete: "CASCADE",
        },
        user_id: {
            type: "uuid",
            notNull: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },
        role: {
            type: "text",
            notNull: true,
        },
        can_send_messages: {
            type: "boolean",
            notNull: true,
            default: true,
        },
        muted_until: {
            type: "TIMESTAMPTZ",
        },
        joined_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
            default: pgm.func('now()'),
        }
    })


    pgm.addConstraint(
        "conversation_participants",
        "conversation_participants_pkey",
        {
            primaryKey: ["conversation_id", "user_id"],
        }
    );


    pgm.createIndex("conversation_participants", ["user_id"], {
        name: "idx_participants_user",
    });
}


export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("conversation_participants", ["user_id"], {
        name: "idx_participants_user",
    });
    pgm.dropTable("conversation_participants");
}
