import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  ok,
  Result,
  Timeoff,
  TimeOffNotFound,
  TimeOffRepository,
} from '@pikslots/domain';
import { TimeoffPersistenceMapper } from '../mappers/timeoff.database.mapper';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { Kysely } from 'kysely';
import { PikSlotsDatabase } from 'src/shared/database/schema';

@Injectable()
export class TimeOffRepositoryImpl implements TimeOffRepository {
  private readonly mapper = new TimeoffPersistenceMapper();
  constructor(@Inject(PIKSLOTS_DB) readonly db: Kysely<PikSlotsDatabase>) {}

  async save(timeoff: Timeoff): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('timeoffs')
        .values(this.mapper.domainToPersistence(timeoff))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to register timeoff',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async findAllByUser(
    userId: string,
    businessId: string,
  ): Promise<Result<Timeoff[], InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('timeoffs')
        .selectAll()
        .where('user_id', '=', userId)
        .where('business_id', '=', businessId)
        .execute();
      if (row.length == 0) return ok([]);
      return ok(row.map((o) => this.mapper.persistenceToDomain(o)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to get timeoffs',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async findById(
    id: string,
  ): Promise<Result<Timeoff, TimeOffNotFound | InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('timeoffs')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();
      if (!row) {
        return err<TimeOffNotFound>({
          kind: 'timeoff_not_found',
          message: 'Timeoff not found',
          by: 'id',
          timestamp: new Date(),
          value: id,
        });
      }
      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to get timeoff by id',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async update(
    timeoff: Timeoff,
  ): Promise<Result<void, TimeOffNotFound | InfrastructureError>> {
    try {
      const row = await this.db
        .updateTable('timeoffs')
        .set(this.mapper.domainToPersistence(timeoff))
        .where('id', '=', timeoff.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();
      if (!row.numUpdatedRows || row.numUpdatedRows == BigInt(0)) {
        return err<TimeOffNotFound>({
          kind: 'timeoff_not_found',
          message: 'Timeoff not found',
          by: 'id',
          timestamp: new Date(),
          value: null,
        });
      }
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to get timeoff by id',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async delete(
    id: string,
  ): Promise<Result<void, TimeOffNotFound | InfrastructureError>> {
    try {
      const result = await this.db
        .deleteFrom('timeoffs')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows === BigInt(0)) {
        return err<TimeOffNotFound>({
          kind: 'timeoff_not_found',
          by: 'id',
          value: id,
          message: `Timeoff not found against ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete timeoff',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
