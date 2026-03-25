import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    // 1. удалить старый constraint
    pgm.dropConstraint('messages', 'messages_sender_id_fkey');

// 2. добавить новый
    pgm.addConstraint('messages', 'messages_sender_id_fkey', {
        foreignKeys: {
            columns: 'sender_id',
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint('messages', 'messages_sender_id_fkey');
    pgm.addConstraint("messages", "messages_sender_id_fkey", "FOREIGN KEY (sender_id) REFERENCES users(id");
}
