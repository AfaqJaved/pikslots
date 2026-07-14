import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  InfrastructureError,
  IUserRepository,
  ok,
  Slot,
  User,
  WeekDay,
} from '@pikslots/domain';
import { getWeekDay, workingHourToUTC } from '@pikslots/datetime';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { GetFreeSlotsForUserUseCaseImpl } from './get.free.slots.for.user.usecase.impl';

const TEST_DATE = '2026-08-10';
const TEST_TIMEZONE = 'UTC';
const TEST_WEEKDAY = getWeekDay(TEST_DATE) as WeekDay;

const toUtc = (time: string) =>
  workingHourToUTC(TEST_DATE, time, TEST_TIMEZONE);

const ALL_DAYS_ENABLED_9_TO_5 = {
  monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  sunday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
};

function buildUser(
  overrides: {
    status?: User['status'];
    workingHours?: typeof ALL_DAYS_ENABLED_9_TO_5;
  } = {},
): User {
  const user = User.create({
    id: 'user-under-test',
    username: 'user_under_test',
    password: 'hashed',
    businessId: 'business-1',
    name: { firstName: 'Test', lastName: 'User' },
    email: 'test-user@pikslots.com',
    phone: '+10000000000',
    role: 'Standard',
    bookingUrl: 'test-user',
    createdBy: 'system',
  }).updateWorkingHours({
    userWorkingHours: overrides.workingHours ?? ALL_DAYS_ENABLED_9_TO_5,
    updatedBy: 'system',
  });

  if (!overrides.status || overrides.status === 'invited') return user;

  // Reach into the entity via reconstitute so we can force an arbitrary status.
  return User.reconstitute({
    id: user.id,
    username: user.username,
    password: user.password,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: overrides.status,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    bookingUrl: user.bookingUrl,
    notificationPreferences: user.notificationPreferences,
    appointmentReminders: user.appointmentReminders,
    userWorkingHours: user.userWorkingHours,
    lastLoginAt: user.lastLoginAt,
    suspendedReason: user.suspendedReason,
    businessId: user.businessId,
    createdAt: user.createdAt,
    createdBy: user.createdBy,
    updatedAt: user.updatedAt,
    updatedBy: user.updatedBy,
    deletedAt: user.deletedAt,
    deletedBy: user.deletedBy,
    isDeleted: user.isDeleted,
  });
}

function buildCommand(
  overrides: Partial<{
    userId: string;
    businessId: string;
    date: string;
    durationInMins: number;
    bufferTimeInMins: number;
    businessTimezone: string;
  }> = {},
) {
  return {
    userId: 'user-under-test',
    businessId: 'business-1',
    date: TEST_DATE,
    durationInMins: 60,
    bufferTimeInMins: 0,
    businessTimezone: TEST_TIMEZONE,
    ...overrides,
  };
}

const INFRA_ERROR: InfrastructureError = {
  kind: 'infrastructure',
  message: 'DB unreachable',
  timestamp: new Date(),
  cause: new Error('boom'),
};

describe('GetFreeSlotsForUserUseCaseImpl', () => {
  let useCase: GetFreeSlotsForUserUseCaseImpl;
  let repository: UserRepositoryTestImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetFreeSlotsForUserUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(GetFreeSlotsForUserUseCaseImpl);
    repository = moduleRef.get(IUserRepository);

    jest.spyOn(repository, 'findById').mockResolvedValue(ok(buildUser()));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('user lookup failures', () => {
    it('propagates an InfrastructureError from findById', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(err(INFRA_ERROR));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toEqual(INFRA_ERROR);
    });

    it('returns user_not_found when the user does not exist', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(ok(null));

      const result = await useCase.execute(
        buildCommand({ userId: 'non-existent' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('user_not_found');
        expect((result.error as any).by).toBe('id');
        expect((result.error as any).value).toBe('non-existent');
      }
    });

    it('returns user_inactive when the user is inactive', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(ok(buildUser({ status: 'inactive' })));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('user_inactive');
    });

    it('returns user_suspended when the user is suspended', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(ok(buildUser({ status: 'suspended' })));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('user_suspended');
    });
  });

  describe('non-working day', () => {
    it('returns an empty array and skips other lookups when the day is disabled', async () => {
      const workingHours = {
        ...ALL_DAYS_ENABLED_9_TO_5,
        [TEST_WEEKDAY]: {
          enabled: false,
          openTime: '09:00',
          closeTime: '17:00',
        },
      };
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(ok(buildUser({ workingHours })));

      const bookedSpy = jest.spyOn(repository, 'findBookedSlotsForUser');
      const breaksSpy = jest.spyOn(repository, 'findUserBreaks');
      const timeoffsSpy = jest.spyOn(repository, 'findUserTimeoffsByDate');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([]);

      expect(bookedSpy).not.toHaveBeenCalled();
      expect(breaksSpy).not.toHaveBeenCalled();
      expect(timeoffsSpy).not.toHaveBeenCalled();
    });
  });

  describe('downstream repository failures', () => {
    it('propagates an InfrastructureError from findBookedSlotsForUser', async () => {
      jest
        .spyOn(repository, 'findBookedSlotsForUser')
        .mockResolvedValueOnce(err(INFRA_ERROR));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toEqual(INFRA_ERROR);
    });

    it('propagates an InfrastructureError from findUserBreaks', async () => {
      jest
        .spyOn(repository, 'findUserBreaks')
        .mockResolvedValueOnce(err(INFRA_ERROR));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toEqual(INFRA_ERROR);
    });

    it('propagates an InfrastructureError from findUserTimeoffsByDate', async () => {
      jest
        .spyOn(repository, 'findUserTimeoffsByDate')
        .mockResolvedValueOnce(err(INFRA_ERROR));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toEqual(INFRA_ERROR);
    });
  });

  describe('all-day timeoff', () => {
    it('returns an empty array when an all-day timeoff exists, ignoring its stored start/end', async () => {
      jest.spyOn(repository, 'findUserTimeoffsByDate').mockResolvedValueOnce(
        ok([
          {
            title: 'Vacation',
            startDateTime: toUtc('09:00'),
            endDateTime: toUtc('09:15'), // deliberately narrow — should still block the whole day
            allDay: true,
            timeZone: TEST_TIMEZONE,
          },
        ]),
      );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([]);
    });

    it('returns an empty array when an all-day timeoff is mixed with bookings/breaks', async () => {
      jest
        .spyOn(repository, 'findBookedSlotsForUser')
        .mockResolvedValueOnce(
          ok([{ startTime: toUtc('10:00'), endTime: toUtc('11:00') }]),
        );
      jest.spyOn(repository, 'findUserTimeoffsByDate').mockResolvedValueOnce(
        ok([
          {
            title: 'Sick day',
            startDateTime: toUtc('09:00'),
            endDateTime: toUtc('17:00'),
            allDay: true,
            timeZone: TEST_TIMEZONE,
          },
        ]),
      );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([]);
    });
  });

  describe('slot generation', () => {
    it('generates back-to-back slots spanning the full working window when nothing is blocked', async () => {
      const result = await useCase.execute(
        buildCommand({ durationInMins: 60, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const expected: Slot[] = [
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
      ].map((start, i) => {
        const startTime = toUtc(start);
        const endHour = 10 + i;
        const endTime = toUtc(`${endHour}:00`);
        return { startTime, endTime };
      });

      expect(result.value).toEqual(expected);
    });

    it('excludes a slot that overlaps an existing booking', async () => {
      jest
        .spyOn(repository, 'findBookedSlotsForUser')
        .mockResolvedValueOnce(
          ok([{ startTime: toUtc('10:00'), endTime: toUtc('11:00') }]),
        );

      const result = await useCase.execute(
        buildCommand({ durationInMins: 60, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(
        result.value.some((slot) => slot.startTime === toUtc('10:00')),
      ).toBe(false);
      expect(result.value).toHaveLength(7);
    });

    it('excludes a slot that overlaps a user break', async () => {
      // UserBreak times from the repository are plain 'HH:mm' — the usecase
      // itself converts them to UTC via workingHourToUTC.
      jest.spyOn(repository, 'findUserBreaks').mockResolvedValueOnce(
        ok([
          {
            day: TEST_WEEKDAY,
            startTime: '13:00',
            endTime: '13:30',
          },
        ]),
      );

      const result = await useCase.execute(
        buildCommand({ durationInMins: 60, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(
        result.value.some((slot) => slot.startTime === toUtc('13:00')),
      ).toBe(false);
      expect(result.value).toHaveLength(7);
    });

    it('excludes a slot that overlaps a non-all-day timeoff', async () => {
      jest.spyOn(repository, 'findUserTimeoffsByDate').mockResolvedValueOnce(
        ok([
          {
            title: 'Appointment',
            startDateTime: toUtc('15:00'),
            endDateTime: toUtc('16:00'),
            allDay: false,
            timeZone: TEST_TIMEZONE,
          },
        ]),
      );

      const result = await useCase.execute(
        buildCommand({ durationInMins: 60, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(
        result.value.some((slot) => slot.startTime === toUtc('15:00')),
      ).toBe(false);
      expect(result.value).toHaveLength(7);
    });

    it('excludes a slot whose buffer runs into a booking even without a direct time overlap', async () => {
      // Window 09:00-11:00, duration 15m, buffer 45m => candidate starts stepped
      // 60m apart: 09:00 and 10:00. Booking 09:30-09:45 doesn't directly overlap
      // either candidate, but the 45m trailing buffer on the 09:00 slot reaches
      // into the booking, so only the 10:00 slot should survive.
      const workingHours = {
        ...ALL_DAYS_ENABLED_9_TO_5,
        [TEST_WEEKDAY]: {
          enabled: true,
          openTime: '09:00',
          closeTime: '11:00',
        },
      };
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(ok(buildUser({ workingHours })));
      jest
        .spyOn(repository, 'findBookedSlotsForUser')
        .mockResolvedValueOnce(
          ok([{ startTime: toUtc('09:30'), endTime: toUtc('09:45') }]),
        );

      const result = await useCase.execute(
        buildCommand({ durationInMins: 15, bufferTimeInMins: 45 }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual([
        { startTime: toUtc('10:00'), endTime: toUtc('10:15') },
      ]);
    });

    it('drops a trailing partial slot when the duration does not evenly divide the window', async () => {
      const workingHours = {
        ...ALL_DAYS_ENABLED_9_TO_5,
        [TEST_WEEKDAY]: {
          enabled: true,
          openTime: '09:00',
          closeTime: '10:00',
        },
      };
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(ok(buildUser({ workingHours })));

      const result = await useCase.execute(
        buildCommand({ durationInMins: 40, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual([
        { startTime: toUtc('09:00'), endTime: toUtc('09:40') },
      ]);
    });

    it('returns an empty array when the whole window is blocked', async () => {
      jest
        .spyOn(repository, 'findBookedSlotsForUser')
        .mockResolvedValueOnce(
          ok([{ startTime: toUtc('09:00'), endTime: toUtc('17:00') }]),
        );

      const result = await useCase.execute(
        buildCommand({ durationInMins: 60, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([]);
    });

    it('clamps the window start to the next 5-minute boundary at or after now', async () => {
      const nowIso = toUtc('11:15'); // already a clean 5-minute mark
      jest.spyOn(Date, 'now').mockReturnValue(new Date(nowIso).getTime());

      const result = await useCase.execute(
        buildCommand({ durationInMins: 60, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual([
        { startTime: toUtc('11:15'), endTime: toUtc('12:15') },
        { startTime: toUtc('12:15'), endTime: toUtc('13:15') },
        { startTime: toUtc('13:15'), endTime: toUtc('14:15') },
        { startTime: toUtc('14:15'), endTime: toUtc('15:15') },
        { startTime: toUtc('15:15'), endTime: toUtc('16:15') },
      ]);
    });

    it('returns an empty array when now is already past the working window', async () => {
      jest
        .spyOn(Date, 'now')
        .mockReturnValue(new Date(toUtc('18:00')).getTime());

      const result = await useCase.execute(
        buildCommand({ durationInMins: 60, bufferTimeInMins: 0 }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([]);
    });
  });
});
