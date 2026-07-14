import type { Result } from '../../shared/result';
import type { InfrastructureError, Slot, UserBreak, WeekDay } from '../../shared';
import type { UserAlreadyExistsError, UserNotFoundError } from '../errors';
import type { User } from '../user.entity';
import type { UserRole } from '../types';

export interface UserRepository {
  save(user: User): Promise<Result<void, UserAlreadyExistsError | InfrastructureError>>;
  findById(id: string): Promise<Result<User | null, UserNotFoundError | InfrastructureError>>;
  findByEmail(email: string): Promise<Result<User | null, UserNotFoundError | InfrastructureError>>;
  findAllByBusiness(businessId: string): Promise<Result<User[], InfrastructureError>>;
  findByUsername(
    username: string,
  ): Promise<Result<User | null, UserNotFoundError | InfrastructureError>>;
  findAllByRole(role: UserRole): Promise<Result<User[], InfrastructureError>>;
  update(user: User): Promise<Result<void, UserNotFoundError | InfrastructureError>>;
  existsByEmail(email: string): Promise<Result<boolean, InfrastructureError>>;
  existsByUsername(username: string): Promise<Result<boolean, InfrastructureError>>;
  findBookedSlotsForUser(
    userId: string,
    businessId: string,
    date: string,
  ): Promise<Result<Slot[], InfrastructureError>>;
  findUserBreaks(
    userId: string,
    busniessId: string,
    day: WeekDay,
  ): Promise<Result<UserBreak[], InfrastructureError>>;
  findUserTimeoffsByDate(
    userId: string,
    businessId: string,
    startDate: string,
  ): Promise<
    Result<
      {
        title: string;
        startDateTime: string;
        endDateTime: string;
        allDay: boolean;
        timeZone: string;
      }[],
      InfrastructureError
    >
  >;
}

export const IUserRepository = Symbol('IUserRepository');
