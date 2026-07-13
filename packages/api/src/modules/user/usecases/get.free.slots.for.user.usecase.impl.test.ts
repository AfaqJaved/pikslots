import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { GetFreeSlotsForUserUseCaseImpl } from './get.free.slots.for.user.usecase.impl';

describe('GetFreeSlotsForUserUseCaseImpl', () => {
  let useCase: GetFreeSlotsForUserUseCaseImpl;
  let repo: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetFreeSlotsForUserUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(GetFreeSlotsForUserUseCaseImpl);
    repo = moduleRef.get(IUserRepository);
  });

  it('returns slots or empty (invited users are allowed by implementation)', async () => {
    const result = await useCase.execute({
      userId: 'user-standard-1',
      businessId: 'business-1',
      date: '2030-06-03', // Monday -> working day
      durationInMins: 30,
      bufferTimeInMins: 0,
      businessTimezone: 'UTC',
    });

    // implementation allows invited users to proceed; assert call succeeds
    expect(result.ok).toBe(true);
  });

  it('returns empty array when working day is off', async () => {
    // Saturday is off by default in test data; request a Saturday date
    const find = await repo.findById('user-standard-1');
    expect(find.ok).toBe(true);
    const user = find.value;
    const updated = user.updateWorkingHours({
      userWorkingHours: {
        monday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
        tuesday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
        wednesday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
        thursday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
        friday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
        saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
        sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
      },
      updatedBy: 'test',
    });

    await repo.update(updated);

    const result = await useCase.execute({
      userId: 'user-standard-1',
      businessId: 'business-1',
      date: '2030-06-01', // Saturday
      durationInMins: 30,
      bufferTimeInMins: 0,
      businessTimezone: 'UTC',
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.length).toBe(0);
  });

  it('returns slots for an active user', async () => {
    // activate user by accepting invite
    const find = await repo.findById('user-standard-1');
    const user = find.value;
    const accepted = user.acceptInvite('new-hashed', 'test');
    const defaultHours = {
      monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
      sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
    };
    const withHours = accepted.updateWorkingHours({
      userWorkingHours: defaultHours,
      updatedBy: 'test',
    });
    await repo.update(withHours);
    const result = await useCase.execute({
      userId: 'user-standard-1',
      businessId: 'business-1',
      date: '2030-06-03', // Monday
      durationInMins: 30,
      bufferTimeInMins: 0,
      businessTimezone: 'UTC',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.value)).toBe(true);
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0].startTime < result.value[0].endTime).toBe(true);
    }
  });

  it('returns user_not_found for missing user', async () => {
    const result = await useCase.execute({
      userId: 'non-existent',
      businessId: 'business-1',
      date: '2030-06-01',
      durationInMins: 30,
      bufferTimeInMins: 0,
      businessTimezone: 'UTC',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_not_found');
    }
  });
});
