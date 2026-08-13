import { randomUUID } from 'node:crypto';
import { USER_ENDPOINTS } from '@pikslots/shared';

import { successBody } from '../common/http-envelope';
import { setupUserTestContext } from './support/user-test-context';
import {
  createBusiness,
  createStaffUser,
  setUserStatus,
  registerServiceForBusiness,
  insertTimeoff,
  getAvailableDatesForBooking,
  futureDateOnWeekday,
} from './support/user-fixtures';

describe(`POST ${USER_ENDPOINTS.AVAILABLE_DATES}`, () => {
  const ctx = setupUserTestContext();

  it('returns candidate dates that never fall on a day disabled in working hours', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId } = await registerServiceForBusiness(ctx, businessId);

    const response = await getAvailableDatesForBooking(
      ctx,
      userId,
      businessId,
      serviceId,
    );

    expect(response.status).toBe(200);
    const data = successBody<{ dates: string[] }>(response).data;
    expect(data.dates.length).toBeGreaterThan(0);
    // DEFAULT_WORKING_HOURS disables Saturday (6) and Sunday (0)
    const weekdays = data.dates.map((d) =>
      new Date(`${d}T00:00:00.000Z`).getUTCDay(),
    );
    expect(weekdays).not.toContain(0);
    expect(weekdays).not.toContain(6);
  });

  it('excludes a near-term date fully blocked by an all-day timeoff', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId } = await registerServiceForBusiness(ctx, businessId);
    // A weekday just 2 days out — virtually certain to fall inside any
    // realistic business scheduling window, even a short one. We can't
    // assert the window's exact size without the domain package, so this
    // sticks to "very near future" rather than a specific day count.
    const nearWeekday = futureDateOnWeekday(1, 2);

    await insertTimeoff(ctx, {
      businessId,
      userId,
      startDateTimeIso: `${nearWeekday}T00:00:00.000Z`,
      endDateTimeIso: `${nearWeekday}T23:59:59.000Z`,
      allDay: true,
    });

    const response = await getAvailableDatesForBooking(
      ctx,
      userId,
      businessId,
      serviceId,
    );

    expect(response.status).toBe(200);
    const data = successBody<{ dates: string[] }>(response).data;
    expect(data.dates).not.toContain(nearWeekday);
  });

  it('returns 404 for a user that does not exist', async () => {
    const response = await getAvailableDatesForBooking(
      ctx,
      randomUUID(),
      randomUUID(),
      randomUUID(),
    );

    expect(response.status).toBe(404);
  });

  it('returns 403 for a suspended user', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId } = await registerServiceForBusiness(ctx, businessId);
    await setUserStatus(ctx, userId, 'suspended', 'Payment overdue');

    const response = await getAvailableDatesForBooking(
      ctx,
      userId,
      businessId,
      serviceId,
    );

    expect(response.status).toBe(403);
  });

  it('returns 403 for an inactive user', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId } = await registerServiceForBusiness(ctx, businessId);
    await setUserStatus(ctx, userId, 'inactive');

    const response = await getAvailableDatesForBooking(
      ctx,
      userId,
      businessId,
      serviceId,
    );

    expect(response.status).toBe(403);
  });

  it('works with no auth token at all (this is a public booking-page endpoint)', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId } = await registerServiceForBusiness(ctx, businessId);

    const response = await getAvailableDatesForBooking(
      ctx,
      userId,
      businessId,
      serviceId,
    );

    expect(response.status).toBe(200);
  });

  it('returns 400 when businessId is an empty string', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');

    const response = await getAvailableDatesForBooking(
      ctx,
      userId,
      '', // empty -> fails PikSlotsStringValidation(1, 100)
      randomUUID(),
    );

    expect(response.status).toBe(400);
  });

  describe('note: serviceId is required by the DTO but never used', () => {
    // GetAvailableDatesDto requires serviceId (@PikSlotsStringValidation),
    // and the controller passes it through as
    // GetAvailableDatesCommand.serviceId -- but
    // GetAvailableDatesForBookingUseCaseImpl never reads it. Availability
    // is computed purely from working hours + all-day timeoffs, with no
    // regard for the requested service's actual duration. This means two
    // services with very different durations on the same user/business
    // currently produce IDENTICAL available-dates results, which may or
    // may not be intended (a short service might fit on a day too full for
    // a long one, but this endpoint can't currently tell the difference).
    // Documented rather than asserted, since "should serviceId affect the
    // result" is a product decision, not an obvious bug.
    it('is not itself a failing test — see the comment above', () => {
      expect(true).toBe(true);
    });
  });
});
