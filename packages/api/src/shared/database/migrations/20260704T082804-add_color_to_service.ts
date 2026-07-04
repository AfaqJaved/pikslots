import { Kysely } from 'kysely';
import { PikSlotsDatabase } from '../schema';

export async function up(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema
    .alterTable('services')
    .addColumn('color_code', 'varchar(10)', (col) =>
      col.defaultTo('#363030').notNull(),
    )
    .execute();
}

export async function down(db: Kysely<PikSlotsDatabase>): Promise<void> {
  await db.schema.alterTable('services').dropColumn('color_code').execute();
}
