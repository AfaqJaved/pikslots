import type { AuditFields } from './audit.table';
import { UserTable } from './user.table';
import { BusinessTable } from './business.table';
import { ServiceTable } from './service.table';

export type { AuditFields };

export interface PikSlotsDatabase {
  users: UserTable;
  businesses: BusinessTable;
  services: ServiceTable;
}
