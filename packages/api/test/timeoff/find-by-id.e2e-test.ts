import { randomUUID } from 'node:crypto';
import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';

import { setupTimeoffTestContext } from './support/timeoff-test-context';
import {
  createOwningBusiness,
  createStaffUser,
  createTimeoff,
  getTimeoffById,
  successBody,
  errorBody,
} from './support/timeoff-fixtures';

describe(`GET ${TIMEOFF_ENDPOINTS.FIND}`, () => {
  const ctx = setupTimeoffTestContext();
  let businessId: string;
  let standardUserId: string;
  let enhancedUserId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
    standardUserId = (await createStaffUser(ctx, businessId, 'Standard')).id;
    enhancedUserId = (await createStaffUser(ctx, businessId, 'Enhanced')).id;
  });

  it('returns the full timeoff record for real', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'Lookup-Target',
      allDay: true,
    });

    const response = await getTimeoffById(ctx, timeoff.id, 'Admin');
    expect(response.status).toBe(200);

    const body = successBody<Record<string, unknown>>(response);
    expect(body.data.id).toBe(timeoff.id);
    expect(body.data.title).toBe('Lookup-Target');
    expect(body.data.userId).toBe(standardUserId);
    expect(body.data.businessId).toBe(businessId);
    expect(body.data.allDay).toBe(true);
    expect(body.data.isDeleted).toBe(false);
  });

  it('returns 404 for a timeoff id that does not exist', async () => {
    const response = await getTimeoffById(ctx, randomUUID(), 'Admin');
    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found|failed to find/i);
  });

  it('allows a Standard user to view their own timeoff', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'Standard-Views-Own',
    });

    const response = await getTimeoffById(
      ctx,
      timeoff.id,
      'Standard',
      standardUserId,
      businessId,
    );
    expect(response.status).toBe(200);
  });

  it("denies a Standard user viewing someone else's timeoff, even in the same business", async () => {
    const timeoff = await createTimeoff(ctx, enhancedUserId, businessId, {
      title: 'Enhanced-Owned-View-Target',
    });

    const response = await getTimeoffById(
      ctx,
      timeoff.id,
      'Standard',
      standardUserId,
      businessId,
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('allows a Platform Owner to view any timeoff regardless of business', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'Platform-Owner-View-Target',
    });

    const response = await getTimeoffById(
      ctx,
      timeoff.id,
      'Platform Owner',
      null,
      'some-other-business',
    );
    expect(response.status).toBe(200);
  });
});
