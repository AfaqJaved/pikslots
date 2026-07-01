import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('breaks')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('day', 'varchar(10)', (col) => col.notNull())
    .addColumn('start_time', 'varchar(5)', (col) => col.notNull())
    .addColumn('end_time', 'varchar(5)', (col) => col.notNull())
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('business_id', 'uuid', (col) =>
      col.notNull().references('businesses.id').onDelete('cascade'),
    )
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

  // fast lookup of all breaks for a user
  await db.schema
    .createIndex('idx_break_user_id')
    .on('breaks')
    .column('user_id')
    .execute();

  // fast lookup of all breaks for a business
  await db.schema
    .createIndex('idx_break_business_id')
    .on('breaks')
    .column('business_id')
    .execute();

  // conflict detection: no two active breaks for same user on same day can overlap
  // overlap check is enforced in app layer via hasConflict()
  await db.schema
    .createIndex('idx_break_user_day_active')
    .on('breaks')
    .columns(['user_id', 'day'])
    .where(sql.ref('is_deleted'), '=', false)
    .execute();

  await db.schema
    .createIndex('idx_break_is_deleted')
    .on('breaks')
    .column('is_deleted')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('breaks').execute();
}
