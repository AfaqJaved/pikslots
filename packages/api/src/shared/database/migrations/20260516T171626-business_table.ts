import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  // Enums
  await sql`CREATE TYPE business_status AS ENUM ('pending_setup', 'active', 'inactive', 'suspended')`.execute(db);
  await sql`CREATE TYPE business_industry AS ENUM ('salon_and_beauty', 'health_and_wellness', 'fitness', 'medical', 'education', 'legal', 'financial', 'hospitality', 'retail', 'other')`.execute(db);
  await sql`CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro', 'enterprise')`.execute(db);
  await sql`CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled')`.execute(db);

  await db.schema
    .createTable('businesses')
    // ── Identity ──────────────────────────────────────────────────────────────
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('owner_id', 'uuid', (c) =>
      c.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('slug', 'varchar(100)', (c) => c.notNull().unique())
    // ── Details ───────────────────────────────────────────────────────────────
    .addColumn('name', 'varchar(255)', (c) => c.notNull())
    .addColumn('description', 'text', (c) => c.defaultTo(null))
    .addColumn('industry', sql`business_industry`, (c) => c.notNull())
    // ── Contact ───────────────────────────────────────────────────────────────
    .addColumn('address', 'text', (c) => c.notNull())
    .addColumn('email', 'varchar(255)', (c) => c.notNull().unique())
    .addColumn('phone', 'varchar(20)', (c) => c.defaultTo(null))
    .addColumn('website', 'varchar(2048)', (c) => c.defaultTo(null))
    .addColumn('logo', 'varchar(2048)', (c) => c.defaultTo(null))
    // ── Status ────────────────────────────────────────────────────────────────
    .addColumn('status', sql`business_status`, (c) =>
      c.notNull().defaultTo('pending_setup'),
    )
    .addColumn('suspended_reason', 'text', (c) => c.defaultTo(null))
    // ── Locale ────────────────────────────────────────────────────────────────
    .addColumn('default_time_zone', 'varchar(64)', (c) =>
      c.notNull().defaultTo('UTC'),
    )
    .addColumn('default_currency', 'varchar(3)', (c) =>
      c.notNull().defaultTo('USD'),
    )
    .addColumn('default_language', 'varchar(10)', (c) =>
      c.notNull().defaultTo('en'),
    )
    // ── Booking config ────────────────────────────────────────────────────────
    .addColumn('booking_allow_online', 'boolean', (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn('booking_requires_confirmation', 'boolean', (c) =>
      c.notNull().defaultTo(false),
    )
    .addColumn('booking_cancellation_window_hours', 'integer', (c) =>
      c.notNull().defaultTo(24),
    )
    .addColumn('booking_window_days', 'integer', (c) =>
      c.notNull().defaultTo(30),
    )
    // ── Subscription ──────────────────────────────────────────────────────────
    .addColumn('subscription_plan', sql`subscription_plan`, (c) =>
      c.notNull().defaultTo('free'),
    )
    .addColumn('subscription_status', sql`subscription_status`, (c) =>
      c.notNull().defaultTo('trialing'),
    )
    .addColumn('trial_ends_at', 'timestamptz', (c) => c.defaultTo(null))
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

  await db.schema
    .createIndex('business_is_deleted_index')
    .on('businesses')
    .column('is_deleted')
    .execute();

  await db.schema
    .createIndex('business_slug_index')
    .on('businesses')
    .column('slug')
    .execute();

  await db.schema
    .createIndex('business_owner_id_index')
    .on('businesses')
    .column('owner_id')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('businesses').execute();
  await sql`DROP TYPE IF EXISTS subscription_status`.execute(db);
  await sql`DROP TYPE IF EXISTS subscription_plan`.execute(db);
  await sql`DROP TYPE IF EXISTS business_industry`.execute(db);
  await sql`DROP TYPE IF EXISTS business_status`.execute(db);
}
