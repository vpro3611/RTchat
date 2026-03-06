import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn("conversations", {
        last_message_at: {
            type: "TIMESTAMPTZ",
            notNull: false,
        },
    });

    pgm.createIndex("conversations", ["last_message_at"], {
        name: "idx_conversations_last_message_at",
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("conversations", ["last_message_at"], {
        name: "idx_conversations_last_message_at"
    });
    pgm.dropColumn("conversations", "last_message_at");
}
