// service-group-assignment.test.data.ts
import { ServiceGroupAssignment } from '@pikslots/domain';

export const SERVICE_GROUP_ASSIGNMENT_TEST_DATA: ServiceGroupAssignment[] = [
  // Active: haircut <-> styling group
  ServiceGroupAssignment.reconstitute({
    id: 'sga-1',
    serviceId: 'service-haircut-1',
    serviceGroupId: 'group-styling-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),

  // Active: color <-> styling group
  ServiceGroupAssignment.reconstitute({
    id: 'sga-2',
    serviceId: 'service-color-1',
    serviceGroupId: 'group-styling-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-02T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),

  // Active: haircut <-> grooming group (haircut belongs to 2 groups — multi-group case)
  ServiceGroupAssignment.reconstitute({
    id: 'sga-3',
    serviceId: 'service-haircut-1',
    serviceGroupId: 'group-grooming-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-03T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-03T00:00:00Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),

  // Soft-deleted: massage <-> grooming group (should be excluded from active queries)
  ServiceGroupAssignment.reconstitute({
    id: 'sga-4',
    serviceId: 'service-massage-1',
    serviceGroupId: 'group-grooming-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-04T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-05T00:00:00Z'),
    updatedBy: 'user-2',
    deletedAt: new Date('2024-01-05T00:00:00Z'),
    deletedBy: 'user-2',
    isDeleted: true,
  }),

  // Different business entirely (business isolation checks)
  ServiceGroupAssignment.reconstitute({
    id: 'sga-5',
    serviceId: 'service-haircut-1',
    serviceGroupId: 'group-styling-1',
    businessId: 'business-2',
    createdAt: new Date('2024-01-06T00:00:00Z'),
    createdBy: 'user-2',
    updatedAt: new Date('2024-01-06T00:00:00Z'),
    updatedBy: 'user-2',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),
];

// Emulates the joined `service_groups.name` / `services.title` columns
// that findGroupsByService / findServicesByGroup would pull from other tables.
export const SERVICE_GROUP_NAME_LOOKUP: Record<string, string> = {
  'group-styling-1': 'Styling',
  'group-grooming-1': 'Grooming',
};

export const SERVICE_TITLE_LOOKUP: Record<string, string> = {
  'service-haircut-1': 'Haircut',
  'service-color-1': 'Hair Coloring',
  'service-massage-1': 'Massage',
};
