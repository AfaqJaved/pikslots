import { ClassGroup, ClassGroupProps } from '@pikslots/domain';

function buildClassGroupProps(
  overrides: Partial<ClassGroupProps>,
): ClassGroupProps {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    id: 'class-group-default',
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

export const CLASS_GROUP_TEST_DATA: ClassGroup[] = [
  // Active group, business-1
  ClassGroup.reconstitute(
    buildClassGroupProps({
      id: 'class-group-hair-1',
      name: 'Hair Styling',
      businessId: 'business-1',
    }),
  ),

  // Active group, business-1, different name — for findAllByBusiness list tests
  ClassGroup.reconstitute(
    buildClassGroupProps({
      id: 'class-group-nails-1',
      name: 'Nail Care',
      businessId: 'business-1',
    }),
  ),

  // Same name as class-group-hair-1, but a DIFFERENT business — proves uniqueness
  // is scoped per-business, not global.
  ClassGroup.reconstitute(
    buildClassGroupProps({
      id: 'class-group-hair-2',
      name: 'Hair Styling',
      businessId: 'business-2',
    }),
  ),

  // Soft-deleted group in business-1, same name as an active-looking scenario we
  // want to allow re-registering. Proves existsByName/save only consider
  // is_deleted = false rows when checking for name collisions.
  ClassGroup.reconstitute(
    buildClassGroupProps({
      id: 'class-group-old-1',
      name: 'Retired Group',
      businessId: 'business-1',
      isDeleted: true,
      deletedAt: new Date('2024-02-01T00:00:00.000Z'),
      deletedBy: 'user-owner-1',
    }),
  ),

  // Decoy in a third business, unrelated to business-1/business-2 test cases.
  ClassGroup.reconstitute(
    buildClassGroupProps({
      id: 'class-group-spa-1',
      name: 'Spa Treatments',
      businessId: 'business-3',
      createdBy: 'user-owner-3',
      updatedBy: 'user-owner-3',
    }),
  ),
];
