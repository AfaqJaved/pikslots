import { Inject, Injectable } from '@nestjs/common';
import { err, IUserRepository, ok } from '@pikslots/domain';
import type {
  AvailableBookingDates,
  GetAvailableDatesCommand,
  GetAvailableDatesForBookingUseCase,
  InfrastructureError,
  Result,
  UserInactiveError,
  UserNotFoundError,
  UserRepository,
  UserSuspendedError,
  WeekDay,
} from '@pikslots/domain';
import {
  createDatesWithinShedulingWindow,
  getWeekDay,
} from '@pikslots/datetime';

const USER_SUSPENDED_ERR: UserSuspendedError = {
  kind: 'user_suspended',
  reason: 'selected users has been suspended',
  message: 'selected users has been suspended',
  timestamp: new Date(),
};

const USER_INACTIVE_ERR: UserInactiveError = {
  kind: 'user_inactive',
  status: 'inactive',
  message: 'selected user is inactive',
  timestamp: new Date(),
};

@Injectable()
export class GetAvailableDatesForBookingUseCaseImpl implements GetAvailableDatesForBookingUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(
    command: GetAvailableDatesCommand,
  ): Promise<
    Result<
      AvailableBookingDates,
      | UserNotFoundError
      | UserSuspendedError
      | UserInactiveError
      | InfrastructureError
    >
  > {
    const userResult = await this.userRepository.findById(command.userId);

    if (!userResult.ok) return err(userResult.error);

    if (!userResult.value) {
      return err<UserNotFoundError>({
        kind: 'user_not_found',
        message: `User not found by id: ${command.userId}`,
        by: 'id',
        value: command.userId,
        timestamp: new Date(),
      });
    }

    if (userResult.value.status === 'inactive') return err(USER_INACTIVE_ERR);

    if (userResult.value.status === 'suspended') return err(USER_SUSPENDED_ERR);

    const windowResult = await this.userRepository.findShedulingWindow(
      command.businessId,
    );

    if (!windowResult.ok) return err(windowResult.error);

    const scheduleingWindow = windowResult.value;

    const candidateDates = createDatesWithinShedulingWindow(
      command.businessTimezone,
      scheduleingWindow,
    );

    const timeoffsResult =
      await this.userRepository.findUserTimeoffsWithinShedulingWindow(
        command.userId,
        command.businessId,
        candidateDates[0],
        candidateDates[candidateDates.length - 1],
      );

    if (!timeoffsResult.ok) return err(timeoffsResult.error);

    const allDayBlock = new Set<string>();

    for (const timeoff of timeoffsResult.value) {
      const start = new Date(timeoff.startDateTime);
      const end = new Date(timeoff.endDateTime);

      const current = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
        ),
      );

      const endUTC = new Date(
        Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
      );

      while (current <= endUTC) {
        allDayBlock.add(current.toISOString().slice(0, 10));
        current.setUTCDate(current.getUTCDate() + 1);
      }
    }

    const dates: string[] = [];

    //   check: user working hours is not off on that day
    //   check:  an all day timeoff blocks the whole day hence  should be not pushed on dates array
    for (const date of candidateDates) {
      const weekDay = getWeekDay(date) as WeekDay;

      // Working day is off, e.g. monday is off.
      if (!userResult.value.userWorkingHours[weekDay].enabled) continue;

      // An all-day timeoff blocks the whole day.
      if (allDayBlock.has(date)) continue;

      dates.push(date);
    }

    return ok({ dates });
  }
}
