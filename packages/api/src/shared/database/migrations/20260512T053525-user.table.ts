import { type Kysely, sql } from 'kysely';
import { PickSlotsDatabase } from '../schema';

export async function up(db: Kysely<PickSlotsDatabase>): Promise<void> {
  // Enums
  await sql`CREATE TYPE user_role AS ENUM ('superAdmin', 'businessOwner', 'locationOwner')`.execute(
    db,
  );
  await sql`CREATE TYPE user_status AS ENUM ('pending_verification', 'active', 'inactive', 'suspended')`.execute(
    db,
  );

  await db.schema
    .createTable('users')
    // ── Identity ──────────────────────────────────────────────────────────────
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('username', 'varchar(50)', (c) => c.notNull().unique())
    .addColumn('password', 'varchar(255)', (c) => c.notNull())
    // ── Name ──────────────────────────────────────────────────────────────────
    .addColumn('first_name', 'varchar(100)', (c) => c.notNull())
    .addColumn('last_name', 'varchar(100)', (c) => c.notNull())
    // ── Contact ───────────────────────────────────────────────────────────────
    .addColumn('email', 'varchar(255)', (c) => c.notNull().unique())
    .addColumn('phone', 'varchar(20)', (c) => c.defaultTo(null))
    // ── Role & status ─────────────────────────────────────────────────────────
    .addColumn('role', sql`user_role`, (c) => c.notNull())
    .addColumn('status', sql`user_status`, (c) =>
      c.notNull().defaultTo('pending_verification'),
    )
    // ── Profile ───────────────────────────────────────────────────────────────
    .addColumn('timezone', 'varchar(64)', (c) => c.notNull().defaultTo('UTC'))
    .addColumn('avatar_url', 'varchar(2048)', (c) => c.defaultTo(null))
    .addColumn('email_verified', 'boolean', (c) => c.notNull().defaultTo(false))
    // ── Notification preferences ──────────────────────────────────────────────
    .addColumn('notification_email', 'boolean', (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn('notification_sms', 'boolean', (c) =>
      c.notNull().defaultTo(false),
    )
    .addColumn('notification_push', 'boolean', (c) =>
      c.notNull().defaultTo(false),
    )
    // ── Activity ──────────────────────────────────────────────────────────────
    .addColumn('last_login_at', 'timestamptz', (c) => c.defaultTo(null))
    .addColumn('suspended_reason', 'text', (c) => c.defaultTo(null))
    // ── Audit ─────────────────────────────────────────────────────────────────
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('created_by', 'uuid', (c) => c.notNull())
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_by', 'uuid', (c) => c.notNull())
    .addColumn('deleted_at', 'timestamptz', (c) => c.defaultTo(null))
    .addColumn('deleted_by', 'uuid', (c) => c.defaultTo(null))
    .addColumn('is_deleted', 'boolean', (c) => c.notNull().defaultTo(false))
    .execute();

  // Index for soft-delete filtering
  await db.schema
    .createIndex('user_is_deleted_index')
    .on('users')
    .column('is_deleted')
    .execute();

  // Index for soft-delete filtering
  await db.schema
    .createIndex('user_email_index')
    .on('users')
    .column('email')
    .execute();

  // Index for soft-delete filtering
  await db.schema
    .createIndex('user_username_index')
    .on('users')
    .column('username')
    .execute();
}

export async function down(db: Kysely<PickSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('users').execute();
  await sql`DROP TYPE IF EXISTS user_status`.execute(db);
  await sql`DROP TYPE IF EXISTS user_role`.execute(db);
}
