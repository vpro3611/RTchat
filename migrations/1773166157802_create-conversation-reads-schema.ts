import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('conversation_reads', {
        conversation_id: {
            type: 'uuid',
            notNull: true,
            references: 'conversations(id)',
            onDelete: 'CASCADE',
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
        last_read_message_id: {
            type: 'uuid',
            references: 'messages(id)',
        },
        read_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    }, {
        constraints: {
            primaryKey: ['conversation_id', 'user_id'],
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('conversation_reads');
}
