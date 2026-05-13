import type { AuditFields } from './audit.table';
import { UserTable } from './user.table';

export type { AuditFields };

export interface PikSlotsDatabase {
  users: UserTable;
}
