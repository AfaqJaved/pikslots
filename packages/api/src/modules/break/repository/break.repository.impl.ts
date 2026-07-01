import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  type Break,
  type BreakRepository,
  type BreakNotFoundError,
  type InfrastructureError,
  type CreateBreakInput,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import type { PikSlotsDatabase } from 'src/shared/database/schema';
import { BreakPersistenceMapper } from '../mappers/break.database.mapper';
import type { Result } from '@pikslots/domain';

@Injectable()
export class BreakRepositoryImpl implements BreakRepository {
  private readonly mapper = new BreakPersistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async save(
    input: CreateBreakInput,
  ): Promise<Result<Break, InfrastructureError>> {
    try {
      const row = await this.db
        .insertInto('user_breaks')
        .values({
          id: input.id,
          user_id: input.userId,
          buisnessId: input.buisnessId,
          day: input.day,
          start_time: input.startTime,
          end_time: input.endTime,
          created_by: input.createdBy,
          updated_by: input.createdBy,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          deleted_by: null,
          is_deleted: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save break',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByUserId(
    userId: string,
  ): Promise<Result<Break[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('user_breaks')
        .selectAll()
        .where('user_id', '=', userId)
        .where('is_deleted', '=', false)
        .orderBy('day')
        .orderBy('start_time')
        .execute();

      return ok(rows.map((row) => this.mapper.persistenceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find breaks by user id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Break | null, BreakNotFoundError | InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('user_breaks')
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

  async delete(
    id: string,
  ): Promise<Result<void, BreakNotFoundError | InfrastructureError>> {
    try {
      const result = await this.db
        .updateTable('user_breaks')
        .set({
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: id,
        })
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows === BigInt(0)) {
        return err<BreakNotFoundError>({
          kind: 'break_not_found',
          message: `Break not found by id: ${id}`,
          by: 'id',
          value: id,
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

  async update(
    break_: Break,
  ): Promise<Result<Break, BreakNotFoundError | InfrastructureError>> {
    try {
      const row = await this.db
        .updateTable('user_breaks')
        .set({
          start_time: break_.startTime,
          end_time: break_.endTime,
          updated_at: new Date(),
          updated_by: break_.updatedBy,
        })
        .where('id', '=', break_.id)
        .where('is_deleted', '=', false)
        .returningAll()
        .executeTakeFirst();

      if (!row) {
        return err<BreakNotFoundError>({
          kind: 'break_not_found',
          message: `Break not found by id: ${break_.id}`,
          by: 'id',
          value: break_.id,
          timestamp: new Date(),
        });
      }

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update break',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
