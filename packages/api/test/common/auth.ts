import { randomUUID } from 'node:crypto';
import type { UserRole } from '@pikslots/domain';
import type { LoginJwtPayload } from '@pikslots/shared';
import type { JwtLoginService } from '../../src/shared/security/jwt/jwt.login.service';

/**
 * Signs a real access token via the real JwtLoginService, for role-gated
 * real-infra tests.
 *
 * `userId` defaults to a fresh random uuid (unchanged behavior for every
 * existing Business/Customer call site that only passes 2-3 args). The
 * Timeoff suite needs to control it explicitly: its authorization rules
 * check `securityContext.userId === <the timeoff's userId>` (an "isSelf"
 * check), which the Business/Customer suites never needed since neither of
 * their domains authorize based on caller identity, only role + business.
 */
export function tokenFor(
  jwtLoginService: JwtLoginService,
  role: UserRole,
  businessId: string | null = null,
  userId?: string | null,
): string {
  const payload: LoginJwtPayload = {
    // Several usecases persist securityContext.userId as a real
    // audit_fields.updated_by uuid column, so this must be a real uuid.
    userId: userId ?? randomUUID(),
    role,
    businessId,
  };
  return jwtLoginService.signAccessToken(payload);
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
