import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { Env } from '../config/env';
import { PickSlotsDatabase } from './schema';

export const PICKSLOTS_DB = 'PICKSLOTS_DB';
export type PickSlotsPersistence = Kysely<PickSlotsDatabase>;

const KyselyProvider = {
  provide: PICKSLOTS_DB,
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<Env, true>,
  ): Promise<PickSlotsPersistence> => {
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString: configService.get('DATABASE_URL', { infer: true }),
        max: 10,
      }).on('error', (error) => {
        console.log('Database error : ' + error.message);
      }),
    });
    const db = new Kysely<PickSlotsDatabase>({ dialect });
    await sql`SELECT 1`.execute(db);
    return db;
  },
};

@Global()
@Module({
  providers: [KyselyProvider],
  exports: [PICKSLOTS_DB],
})
export class PickslotsDatabaseModule {}
