import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint(
        "conversation_reads",
        "conversation_reads_last_read_message_id_fkey"
    );

    pgm.addConstraint(
        "conversation_reads",
        "conversation_reads_last_read_message_id_fkey",
        {
            foreignKeys: {
                columns: "last_read_message_id",
                references: "messages(id)",
                onDelete: "CASCADE",
            },
        }
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint(
        "conversation_reads",
        "conversation_reads_last_read_message_id_fkey"
    );

    pgm.addConstraint(
        "conversation_reads",
        "conversation_reads_last_read_message_id_fkey",
        {
            foreignKeys: {
                columns: "last_read_message_id",
                references: "messages(id)",
            },
        }
    );
}
