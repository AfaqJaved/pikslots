import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';

import { setupClassGroupTestContext } from './support/class-group-test-context';
import {
  createOwningBusiness,
  createClassGroup,
  deleteClassGroup,
  findAllClassGroupsByBusiness,
  successBody,
} from './support/class-group-fixtures';

describe(`GET ${CLASS_GROUP_ENDPOINTS.FIND_ALL_BY_BUSINESS}`, () => {
  const ctx = setupClassGroupTestContext();

  it('lists only active groups for the business, hard-deleted rows excluded', async () => {
    const businessId = await createOwningBusiness(ctx);
    const kept = await createClassGroup(ctx, businessId, { name: 'Kept' });
    const removed = await createClassGroup(ctx, businessId, {
      name: 'Removed',
    });
    await deleteClassGroup(ctx, removed.id, 'Admin', businessId).then((r) =>
      expect(r.status).toBe(200),
    );
    ctx.createdClassGroupIds = ctx.createdClassGroupIds.filter(
      (id) => id !== removed.id,
    );

    const response = await findAllClassGroupsByBusiness(
      ctx,
      businessId,
      'Admin',
    );
    expect(response.status).toBe(200);

    const body = successBody<Array<Record<string, unknown>>>(response);
    const ids = body.data.map((g) => g.id);
    expect(ids).toContain(kept.id);
    expect(ids).not.toContain(removed.id);
  });

  it('returns an empty list for a business with no class groups', async () => {
    const businessId = await createOwningBusiness(ctx);

    const response = await findAllClassGroupsByBusiness(
      ctx,
      businessId,
      'Admin',
    );
    expect(response.status).toBe(200);
    expect(successBody<Array<unknown>>(response).data).toEqual([]);
  });

  /**
   * FLAGGED, not an endorsement -- see register.e2e-test.ts for the full
   * explanation. Same shape of gap as Class's FIND_ALL_BY_BUSINESS.
   */
  it('[FLAGGED] currently allows a Standard user to list class groups for a business that is not theirs', async () => {
    const businessId = await createOwningBusiness(ctx);
    const otherBusinessId = await createOwningBusiness(ctx);
    const group = await createClassGroup(ctx, businessId, {
      name: 'Visible-Cross-Business-Today',
    });

    const response = await findAllClassGroupsByBusiness(
      ctx,
      businessId,
      'Standard',
      otherBusinessId,
    );

    expect(response.status).toBe(200);
    const body = successBody<Array<Record<string, unknown>>>(response);
    expect(body.data.map((g) => g.id)).toContain(group.id);
  });
});
