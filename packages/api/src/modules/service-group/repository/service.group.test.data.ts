import { ServiceGroup, ServiceGroupProps } from '@pikslots/domain';

// ── Fixture data ─────────────────────────────────────────────────────────────
// Built via ServiceGroup.reconstitute() so entities are fully-formed domain
// objects, not raw persistence rows.

function buildServiceGroupProps(
  overrides: Partial<ServiceGroupProps>,
): ServiceGroupProps {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    id: 'service-group-default',
    name: 'Default Group',
    businessId: 'business-1',
    createdAt: now,
    createdBy: 'user-owner-1',
    updatedAt: now,
    updatedBy: 'user-owner-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
    ...overrides,
  };
}

export const SERVICE_GROUP_TEST_DATA: ServiceGroup[] = [
  // Active group, business-1
  ServiceGroup.reconstitute(
    buildServiceGroupProps({
      id: 'service-group-haircut-1',
      name: 'Haircut Services',
      businessId: 'business-1',
    }),
  ),

  // Active group, business-1, different name — for findAllByBusiness list tests
  ServiceGroup.reconstitute(
    buildServiceGroupProps({
      id: 'service-group-color-1',
      name: 'Color Services',
      businessId: 'business-1',
    }),
  ),

  // Same name as service-group-haircut-1, but a DIFFERENT business — proves
  // uniqueness is scoped per-business, not global.
  ServiceGroup.reconstitute(
    buildServiceGroupProps({
      id: 'service-group-haircut-2',
      name: 'Haircut Services',
      businessId: 'business-2',
    }),
  ),

  // Soft-deleted group in business-1, distinct name — proves existsByName/save
  // only consider is_deleted = false rows when checking for name collisions.
  ServiceGroup.reconstitute(
    buildServiceGroupProps({
      id: 'service-group-old-1',
      name: 'Retired Group',
      businessId: 'business-1',
      isDeleted: true,
      deletedAt: new Date('2024-02-01T00:00:00.000Z'),
      deletedBy: 'user-owner-1',
    }),
  ),

  // Decoy in a third business, unrelated to business-1/business-2 test cases.
  ServiceGroup.reconstitute(
    buildServiceGroupProps({
      id: 'service-group-massage-1',
      name: 'Massage Services',
      businessId: 'business-3',
      createdBy: 'user-owner-3',
      updatedBy: 'user-owner-3',
    }),
  ),
];
