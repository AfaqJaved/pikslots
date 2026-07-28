import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessTeamNotificationsCommand,
} from '@pikslots/domain';
import { UpdateBusinessTeamNotificationsUseCaseImpl } from './update.business.team.notifications.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessTeamNotificationsCommand> = {},
): UpdateBusinessTeamNotificationsCommand {
  return {
    id: 'business-1',
    notifyBookingConfirmation: false,
    notifyBookingChanges: false,
    notifyBookingCancellations: true,
    bookingRemindersTime: {
      active: true,
      type: 'email',
      unit: 'hours',
      value: 48,
    },
    extraCCEmails: ['manager@alicessalon.example.com'],
    ...overrides,
  } as UpdateBusinessTeamNotificationsCommand;
}

describe('UpdateBusinessTeamNotificationsUseCaseImpl', () => {
  let useCase: UpdateBusinessTeamNotificationsUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-business-owner-1',
      role: 'Business Owner',
      businessId: 'business-1',
    } as SecurityContext;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessTeamNotificationsUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessTeamNotificationsUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  // Same gap as UpdateBusinessLocationUseCaseImpl and
  // UpdateBusinessNotificationCustomizationUseCaseImpl: SecurityContext is
  // injected but only ever read for `updatedBy` -- no role or ownership
  // check happens anywhere here.
  describe('missing authorization check', () => {
    it('allows an unrelated caller (different business, non-owner role) to edit team notifications', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-999', // completely unrelated to business-1
      });

      const result = await useCase.execute(buildCommand({ id: 'business-1' }));

      expect(result.ok).toBe(true);
    });
  });

  describe('not found', () => {
    it('returns business_not_found when the business does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-business' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
        expect((result.error as BusinessNotFoundError).value).toBe(
          'non-existent-business',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('treats a soft-deleted business as not found', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-deleted-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findById', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(err(infraError));
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates a BusinessNotFoundError raised by update itself', async () => {
      const notFoundError: BusinessNotFoundError = {
        kind: 'business_not_found',
        by: 'id',
        value: 'business-1',
        message: 'Business not found',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
    });
  });

  describe('successful update', () => {
    it('updates all team notification fields and returns the updated entity', async () => {
      const command = buildCommand({
        id: 'business-1',
        notifyBookingConfirmation: false,
        notifyBookingChanges: true,
        notifyBookingCancellations: false,
        bookingRemindersTime: {
          active: false,
          type: 'sms',
          unit: 'days',
          value: 1,
        },
        extraCCEmails: [
          'ops@alicessalon.example.com',
          'billing@alicessalon.example.com',
        ],
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.teamNotifications.notifyBookingConfirmation).toBe(
          command.notifyBookingConfirmation,
        );
        expect(result.value.teamNotifications.notifyBookingChanges).toBe(
          command.notifyBookingChanges,
        );
        expect(result.value.teamNotifications.notifyBookingCancellations).toBe(
          command.notifyBookingCancellations,
        );
        expect(result.value.teamNotifications.bookingRemindersTime).toEqual(
          command.bookingRemindersTime,
        );
        expect(result.value.teamNotifications.extraCCEmails).toEqual(
          command.extraCCEmails,
        );
      }
    });

    it('allows clearing extraCCEmails to an empty array', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', extraCCEmails: [] }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.teamNotifications.extraCCEmails).toEqual([]);
      }
    });

    it('sets updatedBy to the calling SecurityContext userId', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.updatedBy).toBe('user-business-owner-1');
    });

    it('preserves unrelated fields, like name, slug, and customerNotifications', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const after = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(after?.name).toBe(before?.name);
      expect(after?.slug).toBe(before?.slug);
      expect(after?.customerNotifications).toEqual(
        before?.customerNotifications,
      );
    });
  });
});
