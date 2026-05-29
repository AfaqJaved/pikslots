import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('businesses')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('owner_id', 'uuid', (col) => col.notNull().references('users.id'))
    .addColumn('slug', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn(
      'industry',
      sql`varchar CHECK (industry IN ('salon_and_beauty', 'health_and_wellness', 'fitness', 'medical', 'education', 'legal', 'financial', 'hospitality', 'retail', 'other'))`,
      (col) => col.notNull(),
    )
    .addColumn('about', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('appear_in_search_results', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn(
      'status',
      sql`varchar CHECK (status IN ('pending_setup', 'active', 'inactive', 'suspended'))`,
      (col) => col.notNull().defaultTo('pending_setup'),
    )
    .addColumn('suspended_reason', 'text', (col) => col.defaultTo(null))
    // settings
    .addColumn('brand_detail', 'jsonb', (col) => col.notNull())
    .addColumn('brand_appearance_details', 'jsonb', (col) => col.notNull())
    .addColumn('location_details', 'jsonb', (col) => col.notNull())
    .addColumn('booking_policies', 'jsonb', (col) => col.notNull())
    .addColumn('booking_setup', 'jsonb', (col) => col.notNull())
    .addColumn('booking_contact_fields', 'jsonb', (col) => col.notNull())
    .addColumn('booking_customization', 'jsonb', (col) => col.notNull())
    .addColumn('booking_label_overrides', 'jsonb', (col) => col.notNull())
    // notifications
    .addColumn('team_notifications', 'jsonb', (col) =>
      col.notNull().defaultTo(
        sql`'{"notifyBookingConfirmation":true,"notifyBookingChanges":true,"notifyBookingCancellations":true,"bookingRemindersTime":{"unit":"hours","value":24},"extraCCEmails":[]}'::jsonb`,
      ),
    )
    .addColumn('customer_notifications', 'jsonb', (col) =>
      col.notNull().defaultTo(
        sql`'{"notifyBookingConfirmation":true,"notifyBookingChanges":true,"notifyBookingCancellations":true,"bookingRemindersTime":{"unit":"hours","value":24}}'::jsonb`,
      ),
    )
    .addColumn('notification_customization', 'jsonb', (col) =>
      col.notNull().defaultTo(
        sql`'{"emailSenderName":"","emailSignature":""}'::jsonb`,
      ),
    )
    // subscription
    .addColumn(
      'subscription_plan',
      sql`varchar CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise'))`,
      (col) => col.notNull().defaultTo('free'),
    )
    .addColumn(
      'subscription_status',
      sql`varchar CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'cancelled'))`,
      (col) => col.notNull().defaultTo('trialing'),
    )
    .addColumn('trial_ends_at', 'timestamptz', (col) => col.defaultTo(null))
    // audit
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('created_by', 'uuid', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_by', 'uuid', (col) => col.notNull())
    .addColumn('deleted_at', 'timestamptz', (col) => col.defaultTo(null))
    .addColumn('deleted_by', 'uuid', (col) => col.defaultTo(null))
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex('idx_business_slug')
    .on('businesses')
    .column('slug')
    .execute();
  await db.schema
    .createIndex('idx_business_owner_id')
    .on('businesses')
    .column('owner_id')
    .execute();
  await db.schema
    .createIndex('idx_business_is_deleted')
    .on('businesses')
    .column('is_deleted')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('businesses').execute();
}
