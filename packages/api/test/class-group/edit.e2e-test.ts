import { randomUUID } from 'node:crypto';
import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';

import { setupClassGroupTestContext } from './support/class-group-test-context';
import {
  createOwningBusiness,
  createClassGroup,
  editClassGroup,
  errorBody,
} from './support/class-group-fixtures';

describe(`PATCH ${CLASS_GROUP_ENDPOINTS.EDIT}`, () => {
  const ctx = setupClassGroupTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('renames a class group and persists the change for real', async () => {
    const group = await createClassGroup(ctx, businessId, {
      name: 'Before-Rename',
    });

    const response = await editClassGroup(
      ctx,
      group.id,
      businessId,
      { name: 'After-Rename' },
      'Admin',
    );
    expect(response.status).toBe(200);

    const row = await ctx.db
      .selectFrom('class_groups')
      .select('name')
      .where('id', '=', group.id)
      .executeTakeFirstOrThrow();
    expect(row.name).toBe('After-Rename');
  });

  /**
   * EditClassGroupUseCaseImpl only re-checks name uniqueness and issues an
   * UPDATE when `command.name !== group.name` -- editing with the SAME
   * name it already has must NOT be treated as a collision with itself.
   */
  it('allows editing without changing the name (does not collide with itself)', async () => {
    const group = await createClassGroup(ctx, businessId, {
      name: 'Unchanged-Name',
    });

    const response = await editClassGroup(
      ctx,
      group.id,
      businessId,
      { name: 'Unchanged-Name' },
      'Admin',
    );
    expect(response.status).toBe(200);
  });

  it('rejects renaming to a name that collides with another existing group in the same business', async () => {
    const taken = await createClassGroup(ctx, businessId, {
      name: 'Already-Taken-Name',
    });
    const group = await createClassGroup(ctx, businessId, {
      name: 'To-Be-Renamed',
    });

    const response = await editClassGroup(
      ctx,
      group.id,
      businessId,
      { name: taken.name },
      'Admin',
    );

    expect(response.status).toBe(409);
    expect(errorBody(response).message).toMatch(/already exists/i);
  });

  it('returns 404 when editing a class group that does not exist', async () => {
    const response = await editClassGroup(
      ctx,
      randomUUID(),
      businessId,
      { name: 'Does-Not-Matter' },
      'Admin',
    );
    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  /**
   * FLAGGED, not an endorsement -- see register.e2e-test.ts for the full
   * explanation. EditClassGroupUseCaseImpl never checks the caller's
   * business against the group's business at all.
   */
  it('[FLAGGED] currently allows a Business Owner to edit a class group belonging to a business that is not theirs', async () => {
    const group = await createClassGroup(ctx, businessId, {
      name: 'Cross-Tenant-Edit-Target',
    });
    const otherBusinessId = await createOwningBusiness(ctx);

    const response = await editClassGroup(
      ctx,
      group.id,
      businessId,
      { name: 'Cross-Tenant-Edited' },
      'Business Owner',
      otherBusinessId, // caller's token business != the group's real business
    );

    expect(response.status).toBe(200);
  });
});
