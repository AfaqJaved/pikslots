import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessNotificationCustomizationCommand,
} from '@pikslots/domain';
import { UpdateBusinessNotificationCustomizationUseCaseImpl } from './update.business.notification.customization.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessNotificationCustomizationCommand> = {},
): UpdateBusinessNotificationCustomizationCommand {
  return {
    id: 'business-1',
    emailSenderName: "Alice's Salon (Updated Sender)",
    emailSignature: 'Thanks for choosing us!',
    ...overrides,
  } as UpdateBusinessNotificationCustomizationCommand;
}

describe('UpdateBusinessNotificationCustomizationUseCaseImpl', () => {
  let useCase: UpdateBusinessNotificationCustomizationUseCaseImpl;
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
        UpdateBusinessNotificationCustomizationUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessNotificationCustomizationUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  // Same gap as UpdateBusinessLocationUseCaseImpl: SecurityContext is
  // injected but only ever read for `updatedBy` -- no role or ownership
  // check happens anywhere here.
  describe('missing authorization check', () => {
    it('allows an unrelated caller (different business, non-owner role) to edit notification customization', async () => {
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
    it('updates emailSenderName/emailSignature and returns the updated entity', async () => {
      const command = buildCommand({
        id: 'business-1',
        emailSenderName: 'New Sender Name',
        emailSignature: 'New signature text.',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.notificationCustomization.emailSenderName).toBe(
          command.emailSenderName,
        );
        expect(result.value.notificationCustomization.emailSignature).toBe(
          command.emailSignature,
        );
      }
    });

    it('allows setting emailSenderName/emailSignature to empty strings', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'business-1',
          emailSenderName: '',
          emailSignature: '',
        }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.notificationCustomization.emailSenderName).toBe('');
        expect(result.value.notificationCustomization.emailSignature).toBe('');
      }
    });

    it('sets updatedBy to the calling SecurityContext userId', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.updatedBy).toBe('user-business-owner-1');
    });

    it('preserves unrelated fields, like name, slug, and teamNotifications', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const after = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(after?.name).toBe(before?.name);
      expect(after?.slug).toBe(before?.slug);
      expect(after?.teamNotifications).toEqual(before?.teamNotifications);
    });
  });
});
