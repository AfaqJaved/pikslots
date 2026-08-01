import { randomUUID } from 'node:crypto';
import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';

import { setupCustomerTestContext } from './support/customer-test-context';
import {
  createOwningBusiness,
  createCustomer,
  getCustomerById,
  successBody,
  errorBody,
} from './support/customer-fixtures';

describe(`GET ${CUSTOMER_ENDPOINTS.FIND_BY_ID}`, () => {
  const ctx = setupCustomerTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('returns the full customer record for real', async () => {
    const customer = await createCustomer(ctx, businessId, {
      firstName: 'Lookup',
      lastName: 'Target',
      city: 'Karachi',
    });

    const response = await getCustomerById(
      ctx,
      customer.id,
      'Admin',
      businessId,
    );
    expect(response.status).toBe(200);

    const body = successBody<Record<string, unknown>>(response);
    expect(body.data.id).toBe(customer.id);
    expect(body.data.firstName).toBe('Lookup');
    expect(body.data.lastName).toBe('Target');
    expect(body.data.city).toBe('Karachi');
    expect(body.data.businessId).toBe(businessId);
  });

  it('returns 404 for a customer id that does not exist', async () => {
    const response = await getCustomerById(
      ctx,
      randomUUID(),
      'Admin',
      businessId,
    );
    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  it('denies an Enhanced user viewing a customer outside their own business', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await getCustomerById(
      ctx,
      customer.id,
      'Enhanced',
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/access denied/i);
  });

  it('allows a Platform Owner to view a customer in any business', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await getCustomerById(
      ctx,
      customer.id,
      'Platform Owner',
      'some-other-business',
    );

    expect(response.status).toBe(200);
  });
});
