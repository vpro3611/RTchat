import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn("message_attachments", {
        duration: { type: "integer", notNull: false }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn("message_attachments", "duration");
}
