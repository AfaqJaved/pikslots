import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  InfrastructureError,
  IUserRepository,
  ok,
  ShedulingWindow,
  User,
  UserNotFoundError,
} from '@pikslots/domain';
import type { UserWorkingHours } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { GetAvailableDatesForBookingUseCaseImpl } from './get.available.dates.for.booking.usecase.impl';

const TEST_TIMEZONE = 'UTC';
const TEST_NOW = '2026-08-10T10:00:00.000Z';

const ALL_DAYS_ENABLED_9_TO_5: UserWorkingHours = {
  monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  sunday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
};

const DISABLED_SUNDAY: UserWorkingHours = {
  ...ALL_DAYS_ENABLED_9_TO_5,
  sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
};

const ALL_DAYS_DISABLED: UserWorkingHours = {
  monday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
  tuesday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
  wednesday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
  thursday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
  friday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
  saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
  sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
};

function buildUser(
  overrides: Partial<{
    status: User['status'];
    userWorkingHours: UserWorkingHours;
  }> = {},
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
  });

  return User.reconstitute({
    id: user.id,
    username: user.username,
    password: user.password,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: overrides.status ?? 'invited',
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    bookingUrl: user.bookingUrl,
    notificationPreferences: user.notificationPreferences,
    appointmentReminders: user.appointmentReminders,
    userWorkingHours: overrides.userWorkingHours ?? ALL_DAYS_ENABLED_9_TO_5,
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
    serviceId: string;
    businessTimezone: string;
  }> = {},
) {
  return {
    userId: 'user-under-test',
    businessId: 'business-1',
    serviceId: 'service-1',
    businessTimezone: TEST_TIMEZONE,
    ...overrides,
  };
}

const TEN_DAY_WINDOW: ShedulingWindow = { unit: 'days', value: 10 };

const INFRA_ERROR: InfrastructureError = {
  kind: 'infrastructure',
  message: 'DB unreachable',
  timestamp: new Date(),
  cause: new Error('boom'),
};

describe('GetAvailableDatesForBookingUseCaseImpl', () => {
  let useCase: GetAvailableDatesForBookingUseCaseImpl;
  let repository: UserRepositoryTestImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetAvailableDatesForBookingUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(GetAvailableDatesForBookingUseCaseImpl);
    repository = moduleRef.get(IUserRepository);

    jest.spyOn(Date, 'now').mockReturnValue(new Date(TEST_NOW).getTime());
    jest.spyOn(repository, 'findById').mockResolvedValue(ok(buildUser()));
    jest
      .spyOn(repository, 'findShedulingWindow')
      .mockResolvedValue(ok(TEN_DAY_WINDOW));
    jest
      .spyOn(repository, 'findUserTimeoffsWithinShedulingWindow')
      .mockResolvedValue(ok([]));
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
        expect((result.error as UserNotFoundError).by).toBe('id');
        expect((result.error as UserNotFoundError).value).toBe('non-existent');
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

  describe('downstream repository failures', () => {
    it('propagates an InfrastructureError from findShedulingWindow', async () => {
      jest
        .spyOn(repository, 'findShedulingWindow')
        .mockResolvedValueOnce(err(INFRA_ERROR));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toEqual(INFRA_ERROR);
    });

    it('propagates an InfrastructureError from findUserTimeoffsWithinShedulingWindow', async () => {
      jest
        .spyOn(repository, 'findUserTimeoffsWithinShedulingWindow')
        .mockResolvedValueOnce(err(INFRA_ERROR));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toEqual(INFRA_ERROR);
    });
  });

  describe('available date generation', () => {
    it('returns every date within the scheduling window when nothing is blocked', async () => {
      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        dates: [
          '2026-08-10',
          '2026-08-11',
          '2026-08-12',
          '2026-08-13',
          '2026-08-14',
          '2026-08-15',
          '2026-08-16',
          '2026-08-17',
          '2026-08-18',
          '2026-08-19',
        ],
      });
    });

    it('excludes days whose weekday is disabled in the user working hours', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(
          ok(
            buildUser({ userWorkingHours: DISABLED_SUNDAY, status: 'active' }),
          ),
        );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        dates: [
          '2026-08-10',
          '2026-08-11',
          '2026-08-12',
          '2026-08-13',
          '2026-08-14',
          '2026-08-15',
          '2026-08-17',
          '2026-08-18',
          '2026-08-19',
        ],
      });
    });

    it('queries timeoffs once for the whole scheduling window', async () => {
      const timeoffsSpy = jest.spyOn(
        repository,
        'findUserTimeoffsWithinShedulingWindow',
      );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(timeoffsSpy).toHaveBeenCalledTimes(1);
      expect(timeoffsSpy).toHaveBeenCalledWith(
        'user-under-test',
        'business-1',
        '2026-08-10',
        '2026-08-19',
      );
    });

    it('excludes a single day covered by an all-day timeoff', async () => {
      jest
        .spyOn(repository, 'findUserTimeoffsWithinShedulingWindow')
        .mockResolvedValueOnce(
          ok([
            {
              title: 'Vacation',
              startDateTime: '2026-08-13T00:00:00.000Z',
              endDateTime: '2026-08-14T00:00:00.000Z',
              allDay: true,
              timeZone: TEST_TIMEZONE,
            },
          ]),
        );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        dates: [
          '2026-08-10',
          '2026-08-11',
          '2026-08-12',
          '2026-08-15',
          '2026-08-16',
          '2026-08-17',
          '2026-08-18',
          '2026-08-19',
        ],
      });
    });

    it('blocks every day an all-day timeoff spans', async () => {
      jest
        .spyOn(repository, 'findUserTimeoffsWithinShedulingWindow')
        .mockResolvedValueOnce(
          ok([
            {
              title: 'Conference',
              startDateTime: '2026-08-12T00:00:00.000Z',
              endDateTime: '2026-08-15T00:00:00.000Z',
              allDay: true,
              timeZone: TEST_TIMEZONE,
            },
          ]),
        );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        dates: [
          '2026-08-10',
          '2026-08-11',
          '2026-08-16',
          '2026-08-17',
          '2026-08-18',
          '2026-08-19',
        ],
      });
    });

    it('ignores non-all-day timeoffs', async () => {
      jest
        .spyOn(repository, 'findUserTimeoffsWithinShedulingWindow')
        .mockResolvedValueOnce(
          ok([
            {
              title: 'Lunch',
              startDateTime: '2026-08-13T12:00:00.000Z',
              endDateTime: '2026-08-13T13:00:00.000Z',
              allDay: false,
              timeZone: TEST_TIMEZONE,
            },
          ]),
        );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.dates).toContain('2026-08-13');
    });

    it('returns an empty list when every working day is disabled', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(
        ok(
          buildUser({
            userWorkingHours: ALL_DAYS_DISABLED,
            status: 'active',
          }),
        ),
      );

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({ dates: [] });
    });

    it('honours the business timezone when crossing midnight in UTC', async () => {
      jest
        .spyOn(Date, 'now')
        .mockReturnValue(new Date('2026-08-10T23:30:00.000Z').getTime());

      const result = await useCase.execute(
        buildCommand({ businessTimezone: 'Asia/Kolkata' }),
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        dates: [
          '2026-08-11',
          '2026-08-12',
          '2026-08-13',
          '2026-08-14',
          '2026-08-15',
          '2026-08-16',
          '2026-08-17',
          '2026-08-18',
          '2026-08-19',
          '2026-08-20',
        ],
      });
    });

    it('respects a window expressed in weeks', async () => {
      jest
        .spyOn(repository, 'findShedulingWindow')
        .mockResolvedValueOnce(ok({ unit: 'weeks', value: 1 }));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.dates).toEqual([
        '2026-08-10',
        '2026-08-11',
        '2026-08-12',
        '2026-08-13',
        '2026-08-14',
        '2026-08-15',
        '2026-08-16',
      ]);
    });
  });
});
