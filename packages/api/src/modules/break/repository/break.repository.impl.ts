import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  BreakNotFoundError,
  BreakRepository,
  err,
  InfrastructureError,
  ok,
  Result,
  WeekDay,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { BreakPersistenceMapper } from '../mappers/break.database.mapper';

@Injectable()
export class BreakRepositoryImpl implements BreakRepository {
  private readonly mapper = new BreakPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) { }

  async save(breakEntity: Break): Promise<Result<void, InfrastructureError>> {
    try {
      await this.db
        .insertInto('breaks')
        .values(this.mapper.domainToPersistence(breakEntity))
        .execute();
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save break',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Break | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('breaks')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find break by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByUser(
    userId: string,
  ): Promise<Result<Break[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('breaks')
        .selectAll()
        .where('user_id', '=', userId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find breaks by user',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Break[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('breaks')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find breaks by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByUserAndDay(
    userId: string,
    day: WeekDay,
  ): Promise<Result<Break[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('breaks')
        .selectAll()
        .where('user_id', '=', userId)
        .where('day', '=', day)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find breaks by user and day',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    breakEntity: Break,
  ): Promise<Result<void, BreakNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('breaks')
        .set(this.mapper.domainToPersistence(breakEntity))
        .where('id', '=', breakEntity.id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<BreakNotFoundError>({
          kind: 'break_not_found',
          by: 'id',
          value: breakEntity.id,
          message: `Break not found for id: ${breakEntity.id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update break',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, BreakNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('breaks')
        .set({ is_deleted: true, deleted_at: new Date() })
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<BreakNotFoundError>({
          kind: 'break_not_found',
          by: 'id',
          value: id,
          message: `Break not found for id: ${id}`,
          timestamp: new Date(),
        });
      }

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete break',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async hasConflict(
    userId: string,
    day: WeekDay,
    startTime: string,
    endTime: string,
    excludeBreakId?: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      let query = this.db
        .selectFrom('breaks')
        .select('id')
        .where('user_id', '=', userId)
        .where('day', '=', day)
        .where('is_deleted', '=', false)
        .where('start_time', '<', endTime)
        .where('end_time', '>', startTime);

      if (excludeBreakId) {
        query = query.where('id', '!=', excludeBreakId);
      }

      const row = await query.executeTakeFirst();
      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check break conflict',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
