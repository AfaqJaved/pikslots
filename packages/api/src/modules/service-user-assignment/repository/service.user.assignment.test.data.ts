import {
  ServiceUserAssignment,
  ServiceUserAssignmentProps,
} from '@pikslots/domain';

function buildServiceUserAssignmentProps(
  overrides: Partial<ServiceUserAssignmentProps>,
): ServiceUserAssignmentProps {
  const now = new Date('2024-01-01T00:00:00.000Z');

  return {
    id: 'assignment-default',
    serviceId: 'service-1',
    userId: 'user-1',
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

export const SERVICE_USER_ASSIGNMENT_TEST_DATA: ServiceUserAssignment[] = [
  // business-1
  ServiceUserAssignment.reconstitute(
    buildServiceUserAssignmentProps({
      id: 'assignment-1',
      serviceId: 'service-1',
      userId: 'user-1',
      businessId: 'business-1',
    }),
  ),

  ServiceUserAssignment.reconstitute(
    buildServiceUserAssignmentProps({
      id: 'assignment-2',
      serviceId: 'service-1',
      userId: 'user-2',
      businessId: 'business-1',
    }),
  ),

  ServiceUserAssignment.reconstitute(
    buildServiceUserAssignmentProps({
      id: 'assignment-3',
      serviceId: 'service-2',
      userId: 'user-1',
      businessId: 'business-1',
    }),
  ),

  // different business
  ServiceUserAssignment.reconstitute(
    buildServiceUserAssignmentProps({
      id: 'assignment-4',
      serviceId: 'service-3',
      userId: 'user-3',
      businessId: 'business-2',
    }),
  ),

  // soft deleted
  ServiceUserAssignment.reconstitute(
    buildServiceUserAssignmentProps({
      id: 'assignment-deleted',
      serviceId: 'service-4',
      userId: 'user-4',
      businessId: 'business-1',
      isDeleted: true,
      deletedAt: new Date('2024-02-01'),
      deletedBy: 'user-owner-1',
    }),
  ),
];
