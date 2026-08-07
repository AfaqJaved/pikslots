import { CLASS_ENDPOINTS } from '@pikslots/shared';

import { setupClassTestContext } from './support/class-test-context';
import {
  createOwningBusiness,
  createClass,
  deleteClass,
  findAllClassesByBusiness,
  successBody,
} from './support/class-fixtures';

describe(`GET ${CLASS_ENDPOINTS.FIND_ALL_BY_BUSINESS}`, () => {
  const ctx = setupClassTestContext();

  it('lists only active classes for the business, hard-deleted rows excluded', async () => {
    const businessId = await createOwningBusiness(ctx);
    const kept = await createClass(ctx, businessId, { title: 'Kept' });
    const removed = await createClass(ctx, businessId, { title: 'Removed' });
    await deleteClass(ctx, removed.id, 'Admin', businessId).then((r) =>
      expect(r.status).toBe(200),
    );
    ctx.createdClassIds = ctx.createdClassIds.filter((id) => id !== removed.id);

    const response = await findAllClassesByBusiness(ctx, businessId, 'Admin');
    expect(response.status).toBe(200);

    const body = successBody<Array<Record<string, unknown>>>(response);
    const ids = body.data.map((c) => c.id);
    expect(ids).toContain(kept.id);
    expect(ids).not.toContain(removed.id);
  });

  it('returns an empty list for a business with no classes', async () => {
    const businessId = await createOwningBusiness(ctx);

    const response = await findAllClassesByBusiness(ctx, businessId, 'Admin');
    expect(response.status).toBe(200);
    expect(successBody<Array<unknown>>(response).data).toEqual([]);
  });

  /**
   * FINDING, not an endorsement: FindAllClassesByBusinessUseCaseImpl takes
   * `businessId` straight from the URL param and queries with it directly
   * -- there's no `isPartOfSameBusiness` check at all (unlike register/
   * edit/delete, which all check it). The @Roles guard on this route only
   * restricts by role type (any of the 5 valid roles), never by which
   * business the caller's token claims. So today, any authenticated
   * Standard/Enhanced/Admin/etc. user can list ANY business's classes just
   * by knowing its id -- a real cross-tenant info-leak risk.
   *
   * This test pins down that CURRENT behavior so it fails loudly (and
   * needs deleting/inverting) the moment someone adds the missing check --
   * that failure is the fix being verified, not a regression.
   */
  it('[FLAGGED] currently allows a Standard user to list classes for a business that is not theirs (no business-ownership check in this use case)', async () => {
    const businessId = await createOwningBusiness(ctx);
    const otherBusinessId = await createOwningBusiness(ctx);
    const cls = await createClass(ctx, businessId, {
      title: 'Visible-Cross-Business-Today',
    });

    const response = await findAllClassesByBusiness(
      ctx,
      businessId,
      'Standard',
      otherBusinessId, // caller's token business != the businessId being queried
    );

    expect(response.status).toBe(200);
    const body = successBody<Array<Record<string, unknown>>>(response);
    expect(body.data.map((c) => c.id)).toContain(cls.id);
  });
});
