import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';

import { setupCustomerTestContext } from './support/customer-test-context';
import {
  createOwningBusiness,
  createCustomer,
  deleteCustomer,
  findAllCustomersByBusiness,
  successBody,
  errorBody,
} from './support/customer-fixtures';

describe(`GET ${CUSTOMER_ENDPOINTS.FIND_ALL_BY_BUSINESS}`, () => {
  const ctx = setupCustomerTestContext();

  it('lists only active customers for the business, real deleted rows excluded', async () => {
    const businessId = await createOwningBusiness(ctx);

    const kept = await createCustomer(ctx, businessId, { firstName: 'Kept' });
    const removed = await createCustomer(ctx, businessId, {
      firstName: 'Removed',
    });
    await deleteCustomer(ctx, removed.id, 'Admin', businessId).then((r) =>
      expect(r.status).toBe(200),
    );

    const response = await findAllCustomersByBusiness(ctx, businessId, 'Admin');
    expect(response.status).toBe(200);

    const body = successBody<Array<Record<string, unknown>>>(response);
    const ids = body.data.map((c) => c.id);
    expect(ids).toContain(kept.id);
    expect(ids).not.toContain(removed.id);
  });

  it('returns an empty list for a business with no customers', async () => {
    const businessId = await createOwningBusiness(ctx);

    const response = await findAllCustomersByBusiness(ctx, businessId, 'Admin');
    expect(response.status).toBe(200);
    expect(successBody<Array<unknown>>(response).data).toEqual([]);
  });

  it('denies a Business Owner listing customers for a business that is not theirs', async () => {
    const businessId = await createOwningBusiness(ctx);

    const response = await findAllCustomersByBusiness(
      ctx,
      businessId,
      'Business Owner',
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/access denied/i);
  });
});
