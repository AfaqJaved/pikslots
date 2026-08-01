import { randomUUID } from 'node:crypto';
import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';

import { setupCustomerTestContext } from './support/customer-test-context';
import {
  createOwningBusiness,
  createCustomer,
  editCustomer,
  getCustomerById,
  errorBody,
  successBody,
} from './support/customer-fixtures';

describe(`PATCH ${CUSTOMER_ENDPOINTS.EDIT}`, () => {
  const ctx = setupCustomerTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('edits a customer and persists the change for real', async () => {
    const customer = await createCustomer(ctx, businessId, {
      firstName: 'Before',
    });

    await editCustomer(
      ctx,
      customer.id,
      businessId,
      { firstName: 'After', city: 'Austin' },
      'Admin',
    ).then((response) => expect(response.status).toBe(200));

    const getResponse = await getCustomerById(
      ctx,
      customer.id,
      'Admin',
      businessId,
    );
    const body = successBody<Record<string, unknown>>(getResponse);
    expect(body.data.firstName).toBe('After');
    expect(body.data.city).toBe('Austin');
  });

  it('returns 404 when editing a customer that does not exist', async () => {
    const response = await editCustomer(
      ctx,
      randomUUID(),
      businessId,
      {},
      'Admin',
    );

    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  it('denies a Standard user editing a customer outside their own business', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await editCustomer(
      ctx,
      customer.id,
      businessId,
      {},
      'Standard',
      'a-different-business',
    );

    expect(response.status).toBe(401);
    expect(errorBody(response).message).toMatch(/unauthorized/i);
  });

  it('allows a Platform Owner to edit a customer in any business', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await editCustomer(
      ctx,
      customer.id,
      businessId,
      { notes: 'edited by platform owner' },
      'Platform Owner',
      'some-other-business',
    );

    expect(response.status).toBe(200);
  });
});
