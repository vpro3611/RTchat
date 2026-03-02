import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('users', {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        username: {
            type: "varchar(255)",
            notNull: true,
            unique: true,
        },
        email: {
            type: "varchar(255)",
            notNull: true,
            unique: true,
        },
        password_hash: {
            type: "varchar(255)",
            notNull: true,
        },
        is_active: {
            type: "boolean",
            notNull: true,
            default: true,
        },
        // avatar_key: {
        //     type: "text",
        //     notNull: false,
        // },
        last_seen_at: {
            type: "TIMESTAMPTZ",
            notNull: false,
        },
        created_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
        },
        updated_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
            default: pgm.func('now()'),
        },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('users');
}
