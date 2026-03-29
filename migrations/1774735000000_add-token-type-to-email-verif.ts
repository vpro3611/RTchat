import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn("email_verification_tokens", {
        token_type: {
            type: "varchar(50)",
            notNull: true,
            default: "register",
        }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn("email_verification_tokens", "token_type");
}
