import { randomUUID } from 'node:crypto';
import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';

import { setupTimeoffTestContext } from './support/timeoff-test-context';
import {
  createOwningBusiness,
  createStaffUser,
  createTimeoff,
  editTimeoff,
  getTimeoffById,
  successBody,
  errorBody,
} from './support/timeoff-fixtures';

describe(`PATCH ${TIMEOFF_ENDPOINTS.UPDATE}`, () => {
  const ctx = setupTimeoffTestContext();
  let businessId: string;
  let standardUserId: string;
  let enhancedUserId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
    standardUserId = (await createStaffUser(ctx, businessId, 'Standard')).id;
    enhancedUserId = (await createStaffUser(ctx, businessId, 'Enhanced')).id;
  });

  it('edits a timeoff and persists the change for real', async () => {
    const timeoff = await createTimeoff(
      ctx,
      standardUserId,
      businessId,
      { title: 'Before-Edit' },
      'Admin',
    );

    const response = await editTimeoff(
      ctx,
      timeoff.id,
      businessId,
      { title: 'After-Edit', allDay: true },
      'Admin',
    );
    expect(response.status).toBe(200);

    const getResponse = await getTimeoffById(
      ctx,
      timeoff.id,
      'Admin',
      null,
      businessId,
    );
    const body = successBody<Record<string, unknown>>(getResponse);
    expect(body.data.title).toBe('After-Edit');
    expect(body.data.allDay).toBe(true);
  });

  it('allows a Platform Owner to edit any timeoff regardless of business', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'Platform-Owner-Edit-Target',
    });

    const response = await editTimeoff(
      ctx,
      timeoff.id,
      businessId,
      { title: 'Platform-Owner-Edited' },
      'Platform Owner',
      null,
      'some-other-business',
    );

    expect(response.status).toBe(200);
  });

  it('denies a Business Owner editing a timeoff outside their own business', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'BO-Cross-Business-Edit',
    });

    const response = await editTimeoff(
      ctx,
      timeoff.id,
      businessId,
      {},
      'Business Owner',
      null,
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('allows a Standard user to edit their own timeoff', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'Standard-Own-Edit',
    });

    const response = await editTimeoff(
      ctx,
      timeoff.id,
      businessId,
      { title: 'Standard-Own-Edited' },
      'Standard',
      standardUserId,
      businessId,
    );

    expect(response.status).toBe(200);
  });

  it("denies a Standard user editing someone else's timeoff, even in the same business", async () => {
    const timeoff = await createTimeoff(ctx, enhancedUserId, businessId, {
      title: 'Enhanced-Owned-Edit-Target',
    });

    const response = await editTimeoff(
      ctx,
      timeoff.id,
      businessId,
      {},
      'Standard',
      standardUserId,
      businessId,
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('returns 404 when editing a timeoff that does not exist', async () => {
    const response = await editTimeoff(
      ctx,
      randomUUID(),
      businessId,
      {},
      'Admin',
    );

    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });
});
