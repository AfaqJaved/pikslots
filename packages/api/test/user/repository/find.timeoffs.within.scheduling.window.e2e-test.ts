import { IUserRepository } from '@pikslots/domain';
import type { UserRepository } from '@pikslots/domain';
import { createDatesWithinShedulingWindow } from '@pikslots/datetime';

import { setupTimeoffTestContext } from '../../timeoff/support/timeoff-test-context';
import {
  createOwningBusiness,
  createStaffUser,
  createTimeoff,
} from '../../timeoff/support/timeoff-fixtures';

const TIMEZONE = 'America/New_York';

describe('UserRepository.findUserTimeoffsWithinShedulingWindow', () => {
  const ctx = setupTimeoffTestContext();
  let repository: UserRepository;
  let businessId: string;
  let userId: string;
  let windowValue: number;

  beforeAll(async () => {
    repository = ctx.app.get<UserRepository>(IUserRepository);
    businessId = await createOwningBusiness(ctx);
    userId = (await createStaffUser(ctx, businessId, 'Standard')).id;

    const business = await ctx.db
      .selectFrom('businesses')
      .select('booking_policies')
      .where('id', '=', businessId)
      .executeTakeFirstOrThrow();

    windowValue = business.booking_policies.scheduleWindow.value;
  });

  it('returns only the timeoffs that fall inside the scheduling window', async () => {
    const window = { unit: 'days', value: windowValue };
    const dates = createDatesWithinShedulingWindow(TIMEZONE, window);

    const inside = await createTimeoff(ctx, userId, businessId, {
      title: 'Inside-Window',
      startDateTime: `${dates[0]}T10:00:00.000Z`,
      endDateTime: `${dates[0]}T12:00:00.000Z`,
    });

    const outsideBase = new Date(`${dates[0]}T00:00:00.000Z`);
    outsideBase.setUTCDate(outsideBase.getUTCDate() + windowValue + 5);
    const outsideStart = `${outsideBase.toISOString().slice(0, 10)}T10:00:00.000Z`;

    const outside = await createTimeoff(ctx, userId, businessId, {
      title: 'Outside-Window',
      startDateTime: outsideStart,
      endDateTime: `${outsideBase.toISOString().slice(0, 10)}T12:00:00.000Z`,
    });

    const result = await repository.findUserTimeoffsWithinShedulingWindow(
      userId,
      businessId,
      TIMEZONE,
    );

    expect(result.ok).toBe(true);
    const timeoffs = result.ok ? result.value : [];

    const titles = timeoffs.map((t) => t.title);
    expect(titles).toContain(inside.title);
    expect(titles).not.toContain(outside.title);
  });

  it('excludes soft-deleted timeoffs', async () => {
    const window = { unit: 'days', value: windowValue };
    const dates = createDatesWithinShedulingWindow(TIMEZONE, window);

    const softDeleted = await createTimeoff(ctx, userId, businessId, {
      title: 'Soft-Deleted',
      startDateTime: `${dates[0]}T14:00:00.000Z`,
      endDateTime: `${dates[0]}T15:00:00.000Z`,
    });

    await ctx.db
      .updateTable('timeoffs')
      .set({ is_deleted: true, deleted_at: new Date() })
      .where('id', '=', softDeleted.id)
      .execute();

    const result = await repository.findUserTimeoffsWithinShedulingWindow(
      userId,
      businessId,
      TIMEZONE,
    );

    expect(result.ok).toBe(true);
    const titles = result.ok ? result.value.map((t) => t.title) : [];
    expect(titles).not.toContain(softDeleted.title);
  });

  it('returns an empty list for a user with no timeoffs in the window', async () => {
    const freshUserId = (await createStaffUser(ctx, businessId, 'Standard')).id;

    const result = await repository.findUserTimeoffsWithinShedulingWindow(
      freshUserId,
      businessId,
      TIMEZONE,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('unreachable');
    expect(result.value).toEqual([]);
  });
});
