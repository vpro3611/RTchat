import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("email_verification_tokens", {
        id: {
            type: "uuid",
            primaryKey: true,
        },
        user_id: {
            type: "uuid",
            notNull: true,
        },
        token_hash: {
            type: "text",
            notNull: true,
        },
        expires_at: {
            type: "TIMESTAMPTZ",
            notNull: true,
        },
        created_at: {
            type: "TIMESTAMPTZ",
        }
    });

    pgm.addConstraint(
        'email_verification_tokens',
        'fk_user',
        {
            foreignKeys: {
                columns: 'user_id',
                references: 'users(id)',
                onDelete: 'CASCADE',
            },
        }
    );

    pgm.createIndex("email_verification_tokens", "token_hash", {name: "idx_token_hash"});
    pgm.createIndex("email_verification_tokens", "user_id", {name: "idx_user_id"});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("email_verification_tokens", "user_id", {name: "idx_user_id"});
    pgm.dropIndex("email_verification_tokens", "token_hash", {name: "idx_token_hash"});
    pgm.dropConstraint("email_verification_tokens", "fk_user");
    pgm.dropTable("email_verification_tokens");
};
