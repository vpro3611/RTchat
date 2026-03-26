import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createType('join_request_status', [
        'pending',
        'accepted',
        'rejected',
        'expired',
        'cancelled',
        'withdrawn'
    ]);

    // 2. TABLE
    pgm.createTable('conversation_join_requests', {
        id: {
            type: 'uuid',
            primaryKey: true,
        },

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

        status: {
            type: 'join_request_status',
            notNull: true,
            default: 'pending',
        },

        request_message: {
            type: 'text',
            notNull: true,
        },

        submitted_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('now()'),
        },

        reviewed_at: {
            type: 'timestamptz',
        },

        reviewed_by: {
            type: 'uuid',
            references: 'users(id)',
            onDelete: 'SET NULL',
        },

        review_message: {
            type: 'text',
        },

        is_deleted: {
            type: 'boolean',
            notNull: true,
            default: false,
        },
    });

    // 3. INDEXES
    pgm.createIndex('conversation_join_requests', ['conversation_id']);
    pgm.createIndex('conversation_join_requests', ['user_id']);
    pgm.createIndex('conversation_join_requests', ['status']);

    // 4. PARTIAL UNIQUE INDEX (only 1 pending per user per conversation)
    pgm.createIndex(
        'conversation_join_requests',
        ['conversation_id', 'user_id'],
        {
            name: 'uniq_pending_request',
            unique: true,
            where: "status = 'pending'",
        }
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex('conversation_join_requests', ['conversation_id', 'user_id'], {
        name: 'uniq_pending_request',
    });

    pgm.dropIndex('conversation_join_requests', ['status']);
    pgm.dropIndex('conversation_join_requests', ['user_id']);
    pgm.dropIndex('conversation_join_requests', ['conversation_id']);

    pgm.dropTable('conversation_join_requests');

    pgm.dropType('join_request_status');
}
