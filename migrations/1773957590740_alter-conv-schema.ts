import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint("conversations", "conversations_created_by_fkey");

    pgm.addConstraint("conversations", "conversations_created_by_fkey", {
        foreignKeys: {
            columns: "created_by",
            references: "users(id)",
            onDelete: "CASCADE",
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint("conversations", "conversations_created_by_fkey");
    pgm.addConstraint("conversations", "conversations_created_by_fkey", {
        foreignKeys: {
            columns: "created_by",
            references: "users(id)",
        },
    });

}
