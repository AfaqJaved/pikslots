import { Injectable, Scope } from '@nestjs/common';
import type { UserRole } from '@pikslots/domain';

@Injectable({ scope: Scope.REQUEST })
export class SecurityContext {
  userId: string;
  role: UserRole;
}
