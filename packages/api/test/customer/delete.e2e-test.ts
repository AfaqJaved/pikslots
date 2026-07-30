import { randomUUID } from 'node:crypto';
import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';

import { setupCustomerTestContext } from './support/customer-test-context';
import {
  createOwningBusiness,
  createCustomer,
  deleteCustomer,
  getCustomerById,
  errorBody,
} from './support/customer-fixtures';

describe(`DELETE ${CUSTOMER_ENDPOINTS.DELETE}`, () => {
  const ctx = setupCustomerTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('soft-deletes a customer for real and hides it from lookups afterwards', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await deleteCustomer(
      ctx,
      customer.id,
      'Admin',
      businessId,
    );
    expect(response.status).toBe(200);

    const row = await ctx.db
      .selectFrom('customers')
      .select(['is_deleted', 'deleted_at'])
      .where('id', '=', customer.id)
      .executeTakeFirstOrThrow();
    expect(row.is_deleted).toBe(true);
    expect(row.deleted_at).not.toBeNull();

    const getResponse = await getCustomerById(
      ctx,
      customer.id,
      'Admin',
      businessId,
    );
    expect(getResponse.status).toBe(404);
  });

  it('returns 404 deleting a customer that does not exist', async () => {
    const response = await deleteCustomer(
      ctx,
      randomUUID(),
      'Admin',
      businessId,
    );
    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  it('returns 404 deleting a customer that was already deleted', async () => {
    const customer = await createCustomer(ctx, businessId);
    await deleteCustomer(ctx, customer.id, 'Admin', businessId).then((r) =>
      expect(r.status).toBe(200),
    );

    const response = await deleteCustomer(
      ctx,
      customer.id,
      'Admin',
      businessId,
    );
    expect(response.status).toBe(404);
  });

  it('denies an Admin deleting a customer outside their own business', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await deleteCustomer(
      ctx,
      customer.id,
      'Admin',
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('forbids a Standard user from calling delete at all (route-level role guard)', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await deleteCustomer(
      ctx,
      customer.id,
      'Standard',
      businessId,
    );

    expect(response.status).toBe(403);
  });

  it('forbids an Enhanced user from calling delete at all (route-level role guard)', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await deleteCustomer(
      ctx,
      customer.id,
      'Enhanced',
      businessId,
    );

    expect(response.status).toBe(403);
  });
});
