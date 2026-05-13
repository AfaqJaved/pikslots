import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { Env } from '../config/env';
import { PikSlotsDatabase } from './schema';

export const PIKSLOTS_DB = 'PIKSLOTS_DB';
export type PikSlotsPersistence = Kysely<PikSlotsDatabase>;

const KyselyProvider = {
  provide: PIKSLOTS_DB,
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<Env, true>,
  ): Promise<PikSlotsPersistence> => {
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString: configService.get('DATABASE_URL', { infer: true }),
        max: 10,
      }).on('error', (error) => {
        console.log('Database error : ' + error.message);
      }),
    });
    const db = new Kysely<PikSlotsDatabase>({ dialect });
    await sql`SELECT 1`.execute(db);
    return db;
  },
};

@Global()
@Module({
  providers: [KyselyProvider],
  exports: [PIKSLOTS_DB],
})
export class PikslotsDatabaseModule {}
