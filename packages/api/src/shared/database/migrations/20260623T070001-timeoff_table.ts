import { Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('timeoff')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('title', 'varchar', (col) => col.notNull())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').notNull())
    .addColumn('business_id', 'uuid', (col) =>
      col.references('businesses.id').notNull(),
    )
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    .addColumn('end_date', 'timestamptz')
    .addColumn('start_time', 'time')
    .addColumn('end_time', 'time')
    .addColumn('recurrence', 'jsonb')
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
    .createIndex('idx_timeoff_user_id')
    .on('timeoff')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('timeoff').execute();
}
