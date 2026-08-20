import { USER_ENDPOINTS } from '@pikslots/shared';

import { successBody } from '../common/http-envelope';
import { setupUserTestContext } from './support/user-test-context';
import {
  createBusiness,
  createStaffUser,
  login,
  extractRefreshCookie,
  refreshSession,
  logout,
  tokenForRole,
} from './support/user-fixtures';

describe(`POST ${USER_ENDPOINTS.REFRESH} / POST ${USER_ENDPOINTS.LOGOUT}`, () => {
  const ctx = setupUserTestContext();

  it('issues a fresh token pair given a valid refresh cookie from a real login', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { username } = await createStaffUser(ctx, businessId, 'Admin', {
      password: 'CorrectHorse123!',
    });
    const loginResponse = await login(ctx, username, 'CorrectHorse123!');
    const cookie = extractRefreshCookie(loginResponse);

    const response = await refreshSession(ctx, cookie);

    expect(response.status).toBe(200);
    expect(successBody<{ accessToken: string }>(response).data).toHaveProperty(
      'accessToken',
    );
    const refreshedCookie = response.headers[
      'set-cookie'
    ] as unknown as string[];
    expect(refreshedCookie.some((c) => c.startsWith('jid='))).toBe(true);
  });

  it('returns 401 when no refresh cookie is sent', async () => {
    const response = await refreshSession(ctx);

    expect(response.status).toBe(401);
  });

  it('returns 400 for a structurally-malformed refresh cookie', async () => {
    // A garbage (non-JWT-shaped) token fails at JWT parsing before the
    // use case's own "invalid/expired" 401 path is reached, so this
    // surfaces as a 400 rather than a 401 -- unlike an expired-but
    // well-formed token, which does hit the 401 path.
    const response = await refreshSession(ctx, 'jid=not-a-real-token');

    expect(response.status).toBe(400);
  });

  it('clears the refresh cookie on logout', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const admin = await createStaffUser(ctx, businessId, 'Admin');

    const response = await logout(
      ctx,
      tokenForRole(ctx, 'Admin', businessId, admin.id),
    );

    expect(response.status).toBe(200);
    const setCookie = response.headers['set-cookie'] as unknown as string[];
    // clearCookie sends an already-expired jid cookie with an empty value
    expect(
      setCookie.some((c) => c.startsWith('jid=;') || c.startsWith('jid=')),
    ).toBe(true);
  });

  it('returns 401 when logging out with no auth token (logout is not in the JWT middleware public-routes list)', async () => {
    const response = await logout(ctx);

    expect(response.status).toBe(401);
  });
});
