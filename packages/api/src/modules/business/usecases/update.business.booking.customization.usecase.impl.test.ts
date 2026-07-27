import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessBookingCustomizationCommand,
} from '@pikslots/domain';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { UpdateBusinessBookingCustomizationUseCaseImpl } from './update.business.booking.customization.usecase.impl';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessBookingCustomizationCommand> = {},
): UpdateBusinessBookingCustomizationCommand {
  return {
    id: 'business-1',
    language: 'es',
    timeFormat: '24 hours',
    weekStartsOn: 'sunday',
    showBookAnotherAppointmentButton: false,
    showServiceAndClassPrices: false,
    showServiceAndClassDuration: true,
    showBusinessHours: false,
    showLocalTime: false,
    labelService: 'Treatment',
    labelClass: 'Session',
    labelTeamMember: 'Specialist',
    labelCity: 'Town',
    labelState: 'Region',
    labelPostalCode: 'ZIP',
    termsLabel: 'Terms & Conditions',
    termsLink: 'https://example.com/terms',
    requireTermsAcceptance: true,
    redirectLabel: 'Back to site',
    redirectLink: 'https://example.com',
    ...overrides,
  } as UpdateBusinessBookingCustomizationCommand;
}

describe('UpdateBusinessBookingCustomizationUseCaseImpl', () => {
  let useCase: UpdateBusinessBookingCustomizationUseCaseImpl;
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
        UpdateBusinessBookingCustomizationUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessBookingCustomizationUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  describe('missing authorization check', () => {
    it('allows an unrelated caller (different business, non-owner role) to edit the booking customization', async () => {
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
    it('updates bookingCustomization and returns the updated entity', async () => {
      const command = buildCommand({
        id: 'business-1',
        language: 'es',
        timeFormat: '24 hours',
        weekStartsOn: 'sunday',
        showBookAnotherAppointmentButton: false,
        showServiceAndClassPrices: false,
        showServiceAndClassDuration: true,
        showBusinessHours: false,
        showLocalTime: false,
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bookingCustomization).toEqual({
          language: command.language,
          timeFormat: command.timeFormat,
          weekStartsOn: command.weekStartsOn,
          showBookAnotherAppointmentButton:
            command.showBookAnotherAppointmentButton,
          showServiceAndClassPrices: command.showServiceAndClassPrices,
          showServiceAndClassDuration: command.showServiceAndClassDuration,
          showBusinessHours: command.showBusinessHours,
          showLocalTime: command.showLocalTime,
        });
      }
    });

    it('updates bookingLabelOverrides, including the nested terms and redirection objects', async () => {
      const command = buildCommand({
        id: 'business-1',
        labelService: 'Treatment',
        labelClass: 'Session',
        labelTeamMember: 'Specialist',
        labelCity: 'Town',
        labelState: 'Region',
        labelPostalCode: 'ZIP',
        termsLabel: 'Terms & Conditions',
        termsLink: 'https://example.com/terms',
        requireTermsAcceptance: true,
        redirectLabel: 'Back to site',
        redirectLink: 'https://example.com',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bookingLabelOverrides).toEqual({
          service: command.labelService,
          class: command.labelClass,
          teamMember: command.labelTeamMember,
          city: command.labelCity,
          state: command.labelState,
          postalCode: command.labelPostalCode,
          termsAndConditions: {
            label: command.termsLabel,
            link: command.termsLink,
            requireTermsAcceptance: command.requireTermsAcceptance,
          },
          redirection: {
            label: command.redirectLabel,
            link: command.redirectLink,
          },
        });
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
