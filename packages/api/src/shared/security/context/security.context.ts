import { Injectable, Scope } from '@nestjs/common';
import type { UserRole } from '@pickslots/domain';

@Injectable({ scope: Scope.REQUEST })
export class SecurityContext {
  userId: string;
  role: UserRole;
}
