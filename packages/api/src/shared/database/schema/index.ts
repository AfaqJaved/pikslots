import type { AuditFields } from './audit.table';
import { UserTable } from './user.table';
import { BusinessTable } from './business.table';
import { ServiceTable } from './service.table';
import { ServiceGroupTable } from './service.group.table';
import { ServiceGroupAssignmentTable } from './service.group.assignment.table';
import { ServiceUserAssignmentTable } from './service.user.assignment.table';

export type { AuditFields };

export interface PikSlotsDatabase {
  users: UserTable;
  businesses: BusinessTable;
  services: ServiceTable;
  service_groups: ServiceGroupTable;
  service_group_assignments: ServiceGroupAssignmentTable;
  service_user_assignments: ServiceUserAssignmentTable;
}
