import { randomUUID } from 'node:crypto';
import type { UserRole } from '@pikslots/domain';
import type { LoginJwtPayload } from '@pikslots/shared';
import type { JwtLoginService } from '../../src/shared/security/jwt/jwt.login.service';

/** Signs a real access token via the real JwtLoginService, for role-gated real-infra tests. */
export function tokenFor(
  jwtLoginService: JwtLoginService,
  role: UserRole,
  businessId: string | null = null,
): string {
  const payload: LoginJwtPayload = {
    // Several usecases persist securityContext.userId as a real
    // audit_fields.updated_by uuid column, so this must be a real uuid.
    userId: randomUUID(),
    role,
    businessId,
  };
  return jwtLoginService.signAccessToken(payload);
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
