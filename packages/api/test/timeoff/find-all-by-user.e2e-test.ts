import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';

import { setupTimeoffTestContext } from './support/timeoff-test-context';
import {
  createOwningBusiness,
  createStaffUser,
  createTimeoff,
  deleteTimeoff,
  findAllTimeoffsByUser,
  successBody,
  errorBody,
} from './support/timeoff-fixtures';

describe(`GET ${TIMEOFF_ENDPOINTS.FINDALL}`, () => {
  const ctx = setupTimeoffTestContext();
  let businessId: string;
  let standardUserId: string;
  let enhancedUserId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
    standardUserId = (await createStaffUser(ctx, businessId, 'Standard')).id;
    enhancedUserId = (await createStaffUser(ctx, businessId, 'Enhanced')).id;
  });

  it('lists a user’s timeoffs for real, and a hard-deleted one really disappears', async () => {
    const kept = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'FindAll-Kept',
    });
    const removed = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'FindAll-Removed',
    });
    await deleteTimeoff(ctx, removed.id, 'Admin').then((r) =>
      expect(r.status).toBe(200),
    );
    ctx.createdTimeoffIds = ctx.createdTimeoffIds.filter(
      (id) => id !== removed.id,
    );

    const response = await findAllTimeoffsByUser(
      ctx,
      standardUserId,
      businessId,
      'Admin',
    );
    expect(response.status).toBe(200);

    const body = successBody<Array<Record<string, unknown>>>(response);
    const ids = body.data.map((t) => t.id);
    expect(ids).toContain(kept.id);
    expect(ids).not.toContain(removed.id);
  });

  it('returns an empty list for a user with no timeoffs', async () => {
    const freshUserId = (await createStaffUser(ctx, businessId, 'Standard')).id;

    const response = await findAllTimeoffsByUser(
      ctx,
      freshUserId,
      businessId,
      'Admin',
    );
    expect(response.status).toBe(200);
    expect(successBody<Array<unknown>>(response).data).toEqual([]);
  });

  it('allows a Standard user to list their own timeoffs', async () => {
    const response = await findAllTimeoffsByUser(
      ctx,
      standardUserId,
      businessId,
      'Standard',
      standardUserId,
      businessId,
    );
    expect(response.status).toBe(200);
  });

  it("denies a Standard user listing someone else's timeoffs, even in the same business", async () => {
    const response = await findAllTimeoffsByUser(
      ctx,
      enhancedUserId,
      businessId,
      'Standard',
      standardUserId,
      businessId,
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('denies a Business Owner listing timeoffs for a business that is not theirs', async () => {
    const response = await findAllTimeoffsByUser(
      ctx,
      standardUserId,
      businessId,
      'Business Owner',
      null,
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });
});
