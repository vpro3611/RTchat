import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumns("conversations", {
        user_low: {
            type: "uuid",
            notNull: false
        },
        user_high: {
            type: "uuid",
            notNull: false
        }
    });

    pgm.createIndex(
        "conversations",
        ["user_low", "user_high"],
        {
            name: "uniq_direct_conversation",
            unique: true,
            where: "conversation_type = 'direct'"
        }
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("conversations", ["user_low", "user_high"], {
        name: "uniq_direct_conversation"
    });

    pgm.dropColumns("conversations", ["user_low", "user_high"]);
}
