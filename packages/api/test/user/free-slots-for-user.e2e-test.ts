import { randomUUID } from 'node:crypto';
import { USER_ENDPOINTS } from '@pikslots/shared';

import { successBody } from '../common/http-envelope';
import { setupUserTestContext } from './support/user-test-context';
import {
  createBusiness,
  createStaffUser,
  setUserStatus,
  registerServiceForBusiness,
  registerCustomerForBusiness,
  insertBooking,
  insertBreak,
  insertTimeoff,
  getFreeSlotsForUser,
  futureDateOnWeekday,
} from './support/user-fixtures';

describe(`GET ${USER_ENDPOINTS.FREE_SLOTS}`, () => {
  const ctx = setupUserTestContext();

  it('generates slots across the full working window when nothing is booked', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const monday = futureDateOnWeekday(1); // Monday: enabled 09:00-17:00 in DEFAULT_WORKING_HOURS

    const response = await getFreeSlotsForUser(
      ctx,
      userId,
      businessId,
      monday,
      {
        durationInMins: 30,
        bufferTimeInMins: 0,
      },
    );

    expect(response.status).toBe(200);
    const data =
      successBody<{ startTime: string; endTime: string }[]>(response).data;
    // 09:00-17:00 window, 30-min slots, 0 buffer = exactly 16 back-to-back slots
    expect(data).toHaveLength(16);
    expect(data[0].startTime).toBe(`${monday}T09:00:00.000Z`);
    expect(data[data.length - 1].endTime).toBe(`${monday}T17:00:00.000Z`);
  });

  it('returns an empty array on a day the user has disabled in their working hours', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const sunday = futureDateOnWeekday(0); // Sunday: disabled in DEFAULT_WORKING_HOURS

    const response = await getFreeSlotsForUser(ctx, userId, businessId, sunday);

    expect(response.status).toBe(200);
    expect(successBody(response).data).toEqual([]);
  });

  it('excludes slots that overlap an existing real booking', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId } = await registerServiceForBusiness(ctx, businessId);
    const { id: customerId } = await registerCustomerForBusiness(
      ctx,
      businessId,
    );
    const monday = futureDateOnWeekday(1, 14); // further out, distinct from the plain-window test's date

    await insertBooking(ctx, {
      businessId,
      serviceId,
      customerId,
      userId,
      bookingDate: monday,
      startTimeIso: `${monday}T12:00:00.000Z`,
      endTimeIso: `${monday}T12:30:00.000Z`,
    });

    const response = await getFreeSlotsForUser(
      ctx,
      userId,
      businessId,
      monday,
      {
        durationInMins: 30,
        bufferTimeInMins: 0,
      },
    );

    expect(response.status).toBe(200);
    const data =
      successBody<{ startTime: string; endTime: string }[]>(response).data;
    expect(data).toHaveLength(15); // one of the 16 slots (12:00-12:30) is booked
    expect(data.map((s) => s.startTime)).not.toContain(
      `${monday}T12:00:00.000Z`,
    );
  });

  it('excludes slots that overlap a recurring break', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const monday = futureDateOnWeekday(1, 21);

    await insertBreak(ctx, {
      businessId,
      userId,
      day: 'monday',
      startTime: '12:00',
      endTime: '12:30',
    });

    const response = await getFreeSlotsForUser(
      ctx,
      userId,
      businessId,
      monday,
      {
        durationInMins: 30,
        bufferTimeInMins: 0,
      },
    );

    expect(response.status).toBe(200);
    const data =
      successBody<{ startTime: string; endTime: string }[]>(response).data;
    expect(data).toHaveLength(15);
    expect(data.map((s) => s.startTime)).not.toContain(
      `${monday}T12:00:00.000Z`,
    );
  });

  it('returns an empty array on a date fully blocked by an all-day timeoff', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const monday = futureDateOnWeekday(1, 28);

    await insertTimeoff(ctx, {
      businessId,
      userId,
      startDateTimeIso: `${monday}T00:00:00.000Z`,
      endDateTimeIso: `${monday}T23:59:59.000Z`,
      allDay: true,
    });

    const response = await getFreeSlotsForUser(ctx, userId, businessId, monday);

    expect(response.status).toBe(200);
    expect(successBody(response).data).toEqual([]);
  });

  it('returns 404 for a user that does not exist', async () => {
    const monday = futureDateOnWeekday(1);

    const response = await getFreeSlotsForUser(
      ctx,
      randomUUID(),
      randomUUID(),
      monday,
    );

    expect(response.status).toBe(404);
  });

  it('returns 403 for a suspended user', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    await setUserStatus(ctx, userId, 'suspended', 'Payment overdue');
    const monday = futureDateOnWeekday(1);

    const response = await getFreeSlotsForUser(ctx, userId, businessId, monday);

    expect(response.status).toBe(403);
  });

  it('returns 403 for an inactive user', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    await setUserStatus(ctx, userId, 'inactive');
    const monday = futureDateOnWeekday(1);

    const response = await getFreeSlotsForUser(ctx, userId, businessId, monday);

    expect(response.status).toBe(403);
  });

  it('works with no auth token at all (this is a public booking-page endpoint)', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const monday = futureDateOnWeekday(1);

    // getFreeSlotsForUser only sets an Authorization header when a token is
    // passed -- omitted here on purpose.
    const response = await getFreeSlotsForUser(ctx, userId, businessId, monday);

    expect(response.status).toBe(200);
  });

  it('returns 400 when date is not in YYYY-MM-DD format', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');

    const response = await getFreeSlotsForUser(
      ctx,
      userId,
      businessId,
      '08/17/2026',
    );

    expect(response.status).toBe(400);
  });
});
