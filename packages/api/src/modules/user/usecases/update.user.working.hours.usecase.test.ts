import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { UpdateUserWorkingHoursUseCaseImpl } from './update.user.working.hours.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

describe('UpdateUserWorkingHoursUseCaseImpl', () => {
  it('returns user_not_found when user missing', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
				UpdateUserWorkingHoursUseCaseImpl,
				{ provide: IUserRepository, useClass: UserRepositoryTestImpl },
				{ provide: SecurityContext, useValue: { userId: 'any', role: 'Admin', businessId: 'business-1' } },
			],
		}).compile();

		const useCase = moduleRef.get(UpdateUserWorkingHoursUseCaseImpl);

		const result = await useCase.execute({
			userId: 'non-existent',
			userWorkingHours: {},
		} as any);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe('user_not_found');
			expect(result.error.message).toBeDefined();
			expect((result.error as any).by).toBe('id');
			expect((result.error as any).value).toBe('non-existent');
		}
	});

  it('returns working_hours_update_not_authorized when caller not allowed', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateUserWorkingHoursUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: SecurityContext,
          useValue: {
            userId: 'other',
            role: 'Standard',
            businessId: 'business-1',
          },
        },
      ],
		}).compile();

		const useCase = moduleRef.get(UpdateUserWorkingHoursUseCaseImpl);

		const result = await useCase.execute({ userId: 'user-standard-1', userWorkingHours: {}, } as any);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe('working_hours_update_not_authorized');
			expect(result.error.message).toBeDefined();
			expect((result.error as any).updaterRole).toBe('Standard');
		}
	});

	it('updates working hours when allowed (self update)', async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateUserWorkingHoursUseCaseImpl,
				{ provide: IUserRepository, useClass: UserRepositoryTestImpl },
				{ provide: SecurityContext, useValue: { userId: 'user-standard-1', role: 'Standard', businessId: 'business-1' } },
			],
		}).compile();

		const useCase = moduleRef.get(UpdateUserWorkingHoursUseCaseImpl);

		const newHours = {
			monday: { enabled: true, openTime: '10:00', closeTime: '16:00' },
			tuesday: { enabled: true, openTime: '10:00', closeTime: '16:00' },
			wednesday: { enabled: true, openTime: '10:00', closeTime: '16:00' },
			thursday: { enabled: true, openTime: '10:00', closeTime: '16:00' },
			friday: { enabled: true, openTime: '10:00', closeTime: '16:00' },
			saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
			sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
		};

    const result = await useCase.execute({
      userId: 'user-standard-1',
      userWorkingHours: newHours,
    } as any);

    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.value.userWorkingHours.monday.openTime).toBe('10:00');
	});
});
