import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn("messages", {
        original_sender_id: {
            type: "uuid",
            notNull: false,
            references: "users(id)",
        },
        is_resent: {
            type: "boolean",
            notNull: true,
            default: false,
        }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn("messages", "is_resent");
    pgm.dropColumn("messages", "original_sender_id");
}
