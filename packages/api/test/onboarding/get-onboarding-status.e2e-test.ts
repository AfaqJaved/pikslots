import request from 'supertest';
import { ONBOARDING_ENDPOINTS } from '@pikslots/shared';

import { successBody } from '../common/http-envelope';
import { setupOnboardingTestContext } from './support/onboarding-test-context';
import { completeOnboarding } from './support/onboarding-fixtures';

describe(`GET ${ONBOARDING_ENDPOINTS.ONBOARDING_STATUS}`, () => {
  const ctx = setupOnboardingTestContext();

  it('reports the onboarding state as-is from the database', async () => {
    const platformOwnerRows = await ctx.db
      .selectFrom('users')
      .select('id')
      .where('role', '=', 'Platform Owner')
      .where('is_deleted', '=', false)
      .execute();

    const response = await request(ctx.app.getHttpServer())
      .get(ONBOARDING_ENDPOINTS.ONBOARDING_STATUS)
      .expect(200);

    expect(successBody(response).data).toEqual({
      isOnboardingComplete: platformOwnerRows.length > 0,
    });
  });

  it('returns isOnboardingComplete true after onboarding completes', async () => {
    await completeOnboarding(ctx);

    const response = await request(ctx.app.getHttpServer())
      .get(ONBOARDING_ENDPOINTS.ONBOARDING_STATUS)
      .expect(200);

    expect(successBody(response).data).toEqual({ isOnboardingComplete: true });
  });
});
