import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessBookingSetupCommand,
} from '@pikslots/domain';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { UpdateBusinessBookingSetupUseCaseImpl } from './update.business.booking.setup.usecase.impl';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessBookingSetupCommand> = {},
): UpdateBusinessBookingSetupCommand {
  return {
    id: 'business-1',
    bookAppointmentSectionVisible: false,
    bookClassSectionVisible: true,
    aboutUsSectionVisible: false,
    ourTeamSectionVisible: false,
    servicesSectionVisible: true,
    classesSectionVisible: true,
    showFirstAvailable: true,
    skipTeamSelection: true,
    allowToBookMultipleServices: true,
    bypassTeamMemberSelection: true,
    customerLoginEnabled: true,
    customerLoginRequired: true,
    hidePikslotsBranding: true,
    accordionView: false,
    allowRescheduling: true,
    allowCancellations: true,
    showBookNewButton: true,
    nameEnabled: true,
    nameRequired: false,
    emailEnabled: true,
    emailRequired: true,
    phoneEnabled: false,
    phoneRequired: false,
    addressEnabled: true,
    addressRequired: true,
    ...overrides,
  } as UpdateBusinessBookingSetupCommand;
}

describe('UpdateBusinessBookingSetupUseCaseImpl', () => {
  let useCase: UpdateBusinessBookingSetupUseCaseImpl;
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
        UpdateBusinessBookingSetupUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessBookingSetupUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  describe('missing authorization check', () => {
    it('allows an unrelated caller (different business, non-owner role) to edit the booking setup', async () => {
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
    it('updates bookingSetup and returns the updated entity', async () => {
      const command = buildCommand({
        id: 'business-1',
        bookAppointmentSectionVisible: false,
        showFirstAvailable: true,
        skipTeamSelection: true,
        allowToBookMultipleServices: true,
        bypassTeamMemberSelection: true,
        customerLoginEnabled: true,
        customerLoginRequired: true,
        hidePikslotsBranding: true,
        accordionView: false,
        allowRescheduling: true,
        allowCancellations: true,
        showBookNewButton: true,
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bookingSetup).toEqual({
          bookAppointmentSectionVisible: command.bookAppointmentSectionVisible,
          bookClassSectionVisible: command.bookClassSectionVisible,
          aboutUsSectionVisible: command.aboutUsSectionVisible,
          ourTeamSectionVisible: command.ourTeamSectionVisible,
          servicesSectionVisible: command.servicesSectionVisible,
          classesSectionVisible: command.classesSectionVisible,
          showFirstAvailable: command.showFirstAvailable,
          skipTeamSelection: command.skipTeamSelection,
          allowToBookMultipleServices: command.allowToBookMultipleServices,
          bypassTeamMemberSelection: command.bypassTeamMemberSelection,
          customerLoginEnabled: command.customerLoginEnabled,
          customerLoginRequired: command.customerLoginRequired,
          hidePikslotsBranding: command.hidePikslotsBranding,
          accordionView: command.accordionView,
          allowRescheduling: command.allowRescheduling,
          allowCancellations: command.allowCancellations,
          showBookNewButton: command.showBookNewButton,
        });
      }
    });

    it('updates bookingContactFields to match the name/email/phone/address enabled+required flags', async () => {
      const command = buildCommand({
        id: 'business-1',
        nameEnabled: true,
        nameRequired: false,
        emailEnabled: true,
        emailRequired: true,
        phoneEnabled: false,
        phoneRequired: false,
        addressEnabled: true,
        addressRequired: true,
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bookingContactFields.name).toEqual({
          enabled: command.nameEnabled,
          required: command.nameRequired,
        });
        expect(result.value.bookingContactFields.email).toEqual({
          enabled: command.emailEnabled,
          required: command.emailRequired,
        });
        expect(result.value.bookingContactFields.phone).toEqual({
          enabled: command.phoneEnabled,
          required: command.phoneRequired,
        });
        expect(result.value.bookingContactFields.address).toEqual({
          enabled: command.addressEnabled,
          required: command.addressRequired,
        });
      }
    });

    it('preserves customFields on bookingContactFields, since the command has no field for it', async () => {
      // The entity's updateBookingSetup spreads ...this.props.bookingContactFields
      // before overriding name/email/phone/address, so customFields should
      // survive untouched.
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      const originalCustomFields = before?.bookingContactFields.customFields;

      const result = await useCase.execute(buildCommand({ id: 'business-1' }));

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bookingContactFields.customFields).toEqual(
          originalCustomFields,
        );
      }
    });

    it('sets updatedBy to the calling SecurityContext userId', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.updatedBy).toBe('user-business-owner-1');
    });

    it('preserves unrelated fields, like name, slug, and businessHours', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const after = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(after?.name).toBe(before?.name);
      expect(after?.slug).toBe(before?.slug);
      expect(after?.businessHours).toEqual(before?.businessHours);
    });
  });
});
