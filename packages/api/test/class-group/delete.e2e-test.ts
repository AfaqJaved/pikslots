import { randomUUID } from 'node:crypto';
import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';

import { setupClassGroupTestContext } from './support/class-group-test-context';
import {
  createOwningBusiness,
  createClassGroup,
  deleteClassGroup,
  errorBody,
} from './support/class-group-fixtures';

describe(`DELETE ${CLASS_GROUP_ENDPOINTS.DELETE}`, () => {
  const ctx = setupClassGroupTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('really deletes the row from Postgres (hard delete, despite is_deleted/deleted_at columns existing)', async () => {
    const group = await createClassGroup(ctx, businessId, {
      name: 'To-Be-Hard-Deleted',
    });

    const response = await deleteClassGroup(ctx, group.id, 'Admin', businessId);
    expect(response.status).toBe(200);

    const row = await ctx.db
      .selectFrom('class_groups')
      .select('id')
      .where('id', '=', group.id)
      .executeTakeFirst();
    expect(row).toBeUndefined();

    ctx.createdClassGroupIds = ctx.createdClassGroupIds.filter(
      (id) => id !== group.id,
    );
  });

  it('forbids a Standard user from calling delete at all (route-level role guard)', async () => {
    const group = await createClassGroup(ctx, businessId, {
      name: 'Standard-Blocked-Delete',
    });

    const response = await deleteClassGroup(
      ctx,
      group.id,
      'Standard',
      businessId,
    );
    expect(response.status).toBe(403);
  });

  it('returns 404 deleting a class group that does not exist', async () => {
    const response = await deleteClassGroup(
      ctx,
      randomUUID(),
      'Admin',
      businessId,
    );
    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  it('returns 404 deleting a class group that was already deleted', async () => {
    const group = await createClassGroup(ctx, businessId, {
      name: 'Delete-Twice',
    });
    await deleteClassGroup(ctx, group.id, 'Admin', businessId).then((r) =>
      expect(r.status).toBe(200),
    );
    ctx.createdClassGroupIds = ctx.createdClassGroupIds.filter(
      (id) => id !== group.id,
    );

    const response = await deleteClassGroup(ctx, group.id, 'Admin', businessId);
    expect(response.status).toBe(404);
  });

  /**
   * FLAGGED, not an endorsement -- see register.e2e-test.ts for the full
   * explanation. DeleteClassGroupUseCaseImpl only checks existence, never
   * the caller's business against the group's business.
   */
  it('[FLAGGED] currently allows a Business Owner to delete a class group belonging to a business that is not theirs', async () => {
    const group = await createClassGroup(ctx, businessId, {
      name: 'Cross-Tenant-Delete-Target',
    });
    const otherBusinessId = await createOwningBusiness(ctx);

    const response = await deleteClassGroup(
      ctx,
      group.id,
      'Business Owner',
      otherBusinessId,
    );

    expect(response.status).toBe(200);
    ctx.createdClassGroupIds = ctx.createdClassGroupIds.filter(
      (id) => id !== group.id,
    );
  });
});
