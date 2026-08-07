import { randomUUID } from 'node:crypto';
import { CLASS_ENDPOINTS } from '@pikslots/shared';

import { setupClassTestContext } from './support/class-test-context';
import {
  createOwningBusiness,
  createClass,
  deleteClass,
  errorBody,
} from './support/class-fixtures';

describe(`DELETE ${CLASS_ENDPOINTS.DELETE}`, () => {
  const ctx = setupClassTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('really deletes the row from Postgres (hard delete, despite is_deleted/deleted_at columns existing)', async () => {
    const cls = await createClass(ctx, businessId, {
      title: 'To-Be-Hard-Deleted',
    });

    const response = await deleteClass(ctx, cls.id, 'Admin', businessId);
    expect(response.status).toBe(200);

    const row = await ctx.db
      .selectFrom('classes')
      .select('id')
      .where('id', '=', cls.id)
      .executeTakeFirst();
    expect(row).toBeUndefined();

    ctx.createdClassIds = ctx.createdClassIds.filter((id) => id !== cls.id);
  });

  it('denies a Business Owner deleting a class outside their own business', async () => {
    const cls = await createClass(ctx, businessId, {
      title: 'BO-Cross-Business-Delete',
    });

    const response = await deleteClass(
      ctx,
      cls.id,
      'Business Owner',
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('forbids a Standard user from calling delete at all (route-level role guard)', async () => {
    const cls = await createClass(ctx, businessId, {
      title: 'Standard-Blocked-Delete',
    });

    const response = await deleteClass(ctx, cls.id, 'Standard', businessId);
    expect(response.status).toBe(403);
  });

  it('returns 404 deleting a class that does not exist', async () => {
    const response = await deleteClass(ctx, randomUUID(), 'Admin', businessId);
    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  it('returns 404 deleting a class that was already deleted', async () => {
    const cls = await createClass(ctx, businessId, { title: 'Delete-Twice' });
    await deleteClass(ctx, cls.id, 'Admin', businessId).then((r) =>
      expect(r.status).toBe(200),
    );
    ctx.createdClassIds = ctx.createdClassIds.filter((id) => id !== cls.id);

    const response = await deleteClass(ctx, cls.id, 'Admin', businessId);
    expect(response.status).toBe(404);
  });
});
