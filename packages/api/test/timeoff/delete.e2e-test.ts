import { randomUUID } from 'node:crypto';
import { TIMEOFF_ENDPOINTS } from '@pikslots/shared';

import { setupTimeoffTestContext } from './support/timeoff-test-context';
import {
  createOwningBusiness,
  createStaffUser,
  createTimeoff,
  deleteTimeoff,
  errorBody,
} from './support/timeoff-fixtures';

describe(`DELETE ${TIMEOFF_ENDPOINTS.DELETE}`, () => {
  const ctx = setupTimeoffTestContext();
  let businessId: string;
  let standardUserId: string;
  let enhancedUserId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
    standardUserId = (await createStaffUser(ctx, businessId, 'Standard')).id;
    enhancedUserId = (await createStaffUser(ctx, businessId, 'Enhanced')).id;
  });

  it('really deletes the row from Postgres (this is a hard delete, unlike Customer/Business soft-delete)', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'To-Be-Hard-Deleted',
    });

    const response = await deleteTimeoff(
      ctx,
      timeoff.id,
      'Admin',
      null,
      businessId,
    );
    expect(response.status).toBe(200);

    const row = await ctx.db
      .selectFrom('timeoffs')
      .select('id')
      .where('id', '=', timeoff.id)
      .executeTakeFirst();
    expect(row).toBeUndefined();

    // Already deleted for real -- remove the (now-stale) id from cleanup
    // tracking so afterAll doesn't try to delete it again.
    ctx.createdTimeoffIds = ctx.createdTimeoffIds.filter(
      (id) => id !== timeoff.id,
    );
  });

  it('allows a Standard user to delete their own timeoff', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'Standard-Own-Delete',
    });

    const response = await deleteTimeoff(
      ctx,
      timeoff.id,
      'Standard',
      standardUserId,
      businessId,
    );
    expect(response.status).toBe(200);
    ctx.createdTimeoffIds = ctx.createdTimeoffIds.filter(
      (id) => id !== timeoff.id,
    );
  });

  it("denies a Standard user deleting someone else's timeoff", async () => {
    const timeoff = await createTimeoff(ctx, enhancedUserId, businessId, {
      title: 'Enhanced-Owned-Delete-Target',
    });

    const response = await deleteTimeoff(
      ctx,
      timeoff.id,
      'Standard',
      standardUserId,
      businessId,
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('returns 404 deleting a timeoff that does not exist', async () => {
    const response = await deleteTimeoff(
      ctx,
      randomUUID(),
      'Admin',
      null,
      businessId,
    );
    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  it('returns 404 deleting a timeoff that was already deleted', async () => {
    const timeoff = await createTimeoff(ctx, standardUserId, businessId, {
      title: 'Delete-Twice',
    });
    await deleteTimeoff(ctx, timeoff.id, 'Admin', null, businessId).then((r) =>
      expect(r.status).toBe(200),
    );
    ctx.createdTimeoffIds = ctx.createdTimeoffIds.filter(
      (id) => id !== timeoff.id,
    );

    const response = await deleteTimeoff(
      ctx,
      timeoff.id,
      'Admin',
      null,
      businessId,
    );
    expect(response.status).toBe(404);
  });
});
