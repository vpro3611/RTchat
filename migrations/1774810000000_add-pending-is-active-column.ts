import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn("users", {
        pending_is_active: {
            type: "boolean",
            notNull: false,
            default: false,
        }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn("users", "pending_is_active");
}
