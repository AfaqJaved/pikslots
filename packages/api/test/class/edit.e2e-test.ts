import { randomUUID } from 'node:crypto';
import { CLASS_ENDPOINTS } from '@pikslots/shared';

import { setupClassTestContext } from './support/class-test-context';
import {
  createOwningBusiness,
  createClass,
  editClass,
  errorBody,
} from './support/class-fixtures';

describe(`PATCH ${CLASS_ENDPOINTS.UPDATE}`, () => {
  const ctx = setupClassTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('edits a class and persists the change for real', async () => {
    const cls = await createClass(ctx, businessId, { title: 'Before-Edit' });

    const response = await editClass(
      ctx,
      cls.id,
      businessId,
      { title: 'After-Edit', seats: 25, cost: 3000 },
      'Admin',
    );
    expect(response.status).toBe(200);

    const row = await ctx.db
      .selectFrom('classes')
      .selectAll()
      .where('id', '=', cls.id)
      .executeTakeFirstOrThrow();
    expect(row.title).toBe('After-Edit');
    expect(row.seats).toBe(25);
    expect(row.cost).toBe(3000);
  });

  it('allows a Platform Owner to edit any class regardless of business', async () => {
    const cls = await createClass(ctx, businessId, {
      title: 'Platform-Owner-Edit-Target',
    });

    const response = await editClass(
      ctx,
      cls.id,
      businessId,
      { title: 'Platform-Owner-Edited' },
      'Platform Owner',
      'some-other-business',
    );
    expect(response.status).toBe(200);
  });

  it('denies a Business Owner editing a class outside their own business', async () => {
    const cls = await createClass(ctx, businessId, {
      title: 'BO-Cross-Business-Edit',
    });

    const response = await editClass(
      ctx,
      cls.id,
      businessId,
      {},
      'Business Owner',
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('forbids an Enhanced user from calling edit at all (route-level role guard)', async () => {
    const cls = await createClass(ctx, businessId, {
      title: 'Enhanced-Blocked-Edit',
    });

    const response = await editClass(ctx, cls.id, businessId, {}, 'Enhanced');
    expect(response.status).toBe(403);
  });

  it('returns 404 when editing a class that does not exist', async () => {
    const response = await editClass(
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
