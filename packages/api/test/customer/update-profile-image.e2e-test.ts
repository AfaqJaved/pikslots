import { randomUUID } from 'node:crypto';
import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';

import { putRealObject, s3ObjectExists } from '../common/s3-test-client';
import { setupCustomerTestContext } from './support/customer-test-context';
import {
  createOwningBusiness,
  createCustomer,
  updateCustomerProfileImage,
  errorBody,
  successBody,
} from './support/customer-fixtures';

describe(`PATCH ${CUSTOMER_ENDPOINTS.UPDATE_PROFILE_IMAGE}`, () => {
  const ctx = setupCustomerTestContext();
  let businessId: string;

  beforeAll(async () => {
    businessId = await createOwningBusiness(ctx);
  });

  it('deletes the previous image from the real S3 bucket once a new one is set', async () => {
    const s3 = { client: ctx.s3Client, bucket: ctx.s3Bucket };
    const oldKey = `e2e/customers/${randomUUID()}-old.txt`;
    const newKey = `e2e/customers/${randomUUID()}-new.txt`;
    await putRealObject(s3, oldKey, 'old profile image bytes');
    ctx.createdS3Keys.push(oldKey);
    await putRealObject(s3, newKey, 'new profile image bytes');
    ctx.createdS3Keys.push(newKey);

    // profileImageUrl starts at '' via the fixture default, so the first
    // update establishes oldKey as the "current" image without triggering
    // a delete (there's nothing previous to remove yet).
    const customer = await createCustomer(ctx, businessId);
    await updateCustomerProfileImage(
      ctx,
      customer.id,
      oldKey,
      'Admin',
      businessId,
    ).then((r) => expect(r.status).toBe(200));
    expect(await s3ObjectExists(s3, oldKey)).toBe(true);

    // Second update replaces oldKey with newKey; the old one should be
    // deleted for real, the new one left alone.
    const response = await updateCustomerProfileImage(
      ctx,
      customer.id,
      newKey,
      'Admin',
      businessId,
    );
    expect(response.status).toBe(200);
    expect(successBody(response).data).toEqual({ message: 'success' });

    expect(await s3ObjectExists(s3, oldKey)).toBe(false); // really deleted
    expect(await s3ObjectExists(s3, newKey)).toBe(true); // untouched

    const row = await ctx.db
      .selectFrom('customers')
      .select('profile_image_url')
      .where('id', '=', customer.id)
      .executeTakeFirstOrThrow();
    expect(row.profile_image_url).toBe(newKey);
  });

  it('returns 404 updating the profile image of a customer that does not exist', async () => {
    const response = await updateCustomerProfileImage(
      ctx,
      randomUUID(),
      'e2e/customers/does-not-matter.txt',
      'Admin',
      businessId,
    );

    expect(response.status).toBe(404);
    expect(errorBody(response).message).toMatch(/not found/i);
  });

  it('denies a Standard user updating a profile image outside their own business', async () => {
    const customer = await createCustomer(ctx, businessId);

    const response = await updateCustomerProfileImage(
      ctx,
      customer.id,
      'e2e/customers/irrelevant.txt',
      'Standard',
      'a-different-business',
    );

    // This use case's message reads "Can not perform the operation Role
    // <role>" rather than including the word "unauthorized" like
    // register/edit/delete do — asserting on status is the stable check here.
    expect(response.status).toBe(401);
  });
});
