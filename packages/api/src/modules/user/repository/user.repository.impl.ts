import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  Result,
  User,
  UserAlreadyExistsError,
  UserNotFoundError,
  UserRepository,
} from '@pickslots/domain';
import { Kysely } from 'kysely';
import { PICKSLOTS_DB } from 'src/shared/database/pickslots.database.module';
import {
  isUniqueViolation,
  getUniqueViolationField,
} from 'src/shared/database/helpers';
import { PickSlotsDatabase } from 'src/shared/database/schema';
import { UserPersistenceMapper } from '../mappers/user.database.mapper';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly mapper = new UserPersistenceMapper();

  constructor(
    @Inject(PICKSLOTS_DB) private readonly db: Kysely<PickSlotsDatabase>,
  ) {}

  async save(
    user: User,
  ): Promise<Result<void, UserAlreadyExistsError | InfrastructureError>> {
    try {
      await this.db
        .insertInto('users')
        .values(this.mapper.domainToPersistence(user))
        .execute();
      return ok(undefined);
    } catch (cause) {
      if (isUniqueViolation(cause)) {
        const field = getUniqueViolationField(cause);
        return err<UserAlreadyExistsError>({
          kind: 'user_already_exists',
          message: `A user with this ${field} already exists`,
          timestamp: new Date(),
          field,
        });
      }

      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save user',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<User | null, UserNotFoundError | InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', id)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find user by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findByEmail(
    email: string,
  ): Promise<Result<User | null, UserNotFoundError | InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', email)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find user by email',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findByUsername(
    username: string,
  ): Promise<Result<User | null, UserNotFoundError | InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('users')
        .selectAll()
        .where('username', '=', username)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);

      return ok(this.mapper.persistenceToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find user by username',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByEmail(
    email: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('users')
        .select('id')
        .where('email', '=', email)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check user existence by email',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByUsername(
    username: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('users')
        .select('id')
        .where('username', '=', username)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      return ok(row !== undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check user existence by username',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
