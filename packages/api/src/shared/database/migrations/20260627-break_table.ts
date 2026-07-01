import { type Kysely, sql } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .createTable('user_breaks')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('business_id', 'uuid', (col) => col.defaultTo(null))
    .addColumn(
      'day',
      sql`varchar CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))`,
      (col) => col.notNull(),
    )
    .addColumn('start_time', 'varchar(5)', (col) => col.notNull())
    .addColumn('end_time', 'varchar(5)', (col) => col.notNull())
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
    .createIndex('idx_user_breaks_user_id')
    .on('user_breaks')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_user_breaks_is_deleted')
    .on('user_breaks')
    .column('is_deleted')
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.dropTable('user_breaks').execute();
}
