import request from 'supertest';
import { BUSINESS_ENDPOINTS } from '@pikslots/shared';

import { successBody, errorBody } from '../common/http-envelope';
import { waitFor } from '../common/wait-for';
import { setupBusinessTestContext } from './support/business-test-context';
import { createBusiness, registerPayload } from './support/business-fixtures';

describe(`POST ${BUSINESS_ENDPOINTS.REGISTER}`, () => {
  const ctx = setupBusinessTestContext();

  it('persists a real row in Postgres and processes the invite job through the real BullMQ worker', async () => {
    const payload = await registerPayload(ctx);

    const response = await request(ctx.app.getHttpServer())
      .post(BUSINESS_ENDPOINTS.REGISTER)
      .send(payload)
      .expect(201);

    expect(successBody(response).data).toEqual({ message: 'success' });

    const row = await ctx.db
      .selectFrom('businesses')
      .selectAll()
      .where('slug', '=', payload.slug)
      .executeTakeFirstOrThrow();
    ctx.createdBusinessIds.push(row.id);

    expect(row.owner_id).toBe(payload.ownerId);
    expect(row.name).toBe(payload.name);
    expect(row.status).toBe('pending_setup');

    // Real Redis -> real BullMQ worker -> real BusinessRegistrationInvite
    // processor, asynchronously. Only the final email send is mocked.
    await waitFor(() => ctx.sentEmails.mock.calls.length > 0);
    const [emailCall] = ctx.sentEmails.mock.calls as [
      [{ to: string; template: string; context: { businessName: string } }],
    ];
    expect(emailCall[0].to).toBe(payload.ownerEmail);
    expect(emailCall[0].template).toBe('user-invite');
    expect(emailCall[0].context.businessName).toBe(payload.name);
  });

  it('returns 409 when the slug is already taken', async () => {
    const existing = await createBusiness(ctx);

    const response = await request(ctx.app.getHttpServer())
      .post(BUSINESS_ENDPOINTS.REGISTER)
      .send(await registerPayload(ctx, { slug: existing.slug }))
      .expect(409);

    expect(errorBody(response).statusCode).toBe(409);
  });

  it('returns 400 for an invalid payload', async () => {
    const response = await request(ctx.app.getHttpServer())
      .post(BUSINESS_ENDPOINTS.REGISTER)
      .send({})
      .expect(400);

    expect(errorBody(response).statusCode).toBe(400);
    expect(typeof errorBody(response).message).toBe('string');
  });
});
