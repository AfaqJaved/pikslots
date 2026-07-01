import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IUserRepository,
  ok,
  Result,
  Slot,
  UserNotFoundError,
  WeekDay,
} from '@pikslots/domain';
import type {
  GetFreeSlotsForUser,
  GetFreeSlotsForUserCommand,
  UserInactiveError,
  UserRepository,
  UserSuspendedError,
} from '@pikslots/domain';
import {
  getWeekDay,
  isoToMillis,
  millisToIso,
  workingHourToUTC,
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
export class GetFreeSlotsForUserUseCaseImpl implements GetFreeSlotsForUser {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(
    command: GetFreeSlotsForUserCommand,
  ): Promise<
    Result<
      Slot[],
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

    const user = userResult.value;
    const weekDay = getWeekDay(command.date) as WeekDay;
    const dayHours = user.userWorkingHours[weekDay];

    // working day is off i.e monday is off
    if (!dayHours.enabled) return ok([]);

    // Convert the working hour stored as HH:mm to utc string (based on the timezone )
    // like -> ISO 8601 UTC string, e.g. "2025-06-16T13:00:00.000Z"
    const windowStart = workingHourToUTC(
      command.date,
      dayHours.openTime,
      command.businessTimezone,
    );
    const windowEnd = workingHourToUTC(
      command.date,
      dayHours.closeTime,
      command.businessTimezone,
    );

    const bookedResult = await this.userRepository.findBookedSlotsForUser(
      command.userId,
      command.businessId,
      command.date,
    );

    if (!bookedResult.ok) return err(bookedResult.error);

    // TODO BREAKS
    // TODO TIMEOFFS
    return ok(
      this.generateSlots(
        windowStart,
        windowEnd,
        bookedResult.value,
        command.durationInMins,
        command.bufferTimeInMins,
      ),
    );
  }

  /**
   * Generates non-overlapping available time slots within a working window,
   * skipping any slot that conflicts with an existing booking (± buffer time).
   *
   * Slots are produced at fixed intervals of `durationMins` from `windowStart`.
   * A slot is excluded if it overlaps with any booked slot once the buffer is
   * applied on both sides of that booking.
   *
   * @param windowStart  - ISO 8601 UTC string marking the start of the working window
   * @param windowEnd    - ISO 8601 UTC string marking the end of the working window
   * @param bookedSlots  - Existing bookings for the day (ISO 8601 UTC start/end times)
   * @param durationMins - Duration of each generated slot in minutes
   * @param bufferMins   - Buffer time around each existing booking in minutes
   * @returns Array of available slots with ISO 8601 UTC start and end times
   */
  private generateSlots(
    windowStart: string,
    windowEnd: string,
    bookedSlots: Slot[],
    durationMins: number,
    bufferMins: number,
  ): Slot[] {
    const slots: Slot[] = [];
    const durationMs = durationMins * 60_000; // convert to ms unix timetamp
    const bufferMs = bufferMins * 60_000;

    let current = isoToMillis(windowStart);
    const endMs = isoToMillis(windowEnd);

    while (current + durationMs <= endMs) {
      const slotEnd = current + durationMs;

      const hasConflict = bookedSlots.some(({ startTime, endTime }) => {
        const bookedStart = isoToMillis(startTime);
        const bookedEnd = isoToMillis(endTime);
        return current < bookedEnd && slotEnd > bookedStart;
      });

      if (!hasConflict) {
        slots.push({
          startTime: millisToIso(current),
          endTime: millisToIso(slotEnd),
        });
      }

      current += durationMs + bufferMs;
    }

    return slots;
  }
}
