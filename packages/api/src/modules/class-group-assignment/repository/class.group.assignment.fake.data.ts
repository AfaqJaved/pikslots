// class-group-assignment.test.data.ts
import { ClassGroupAssignment } from '@pikslots/domain';

export const CLASS_GROUP_ASSIGNMENT_TEST_DATA: ClassGroupAssignment[] = [
  ClassGroupAssignment.reconstitute({
    id: 'cga-1',
    classId: 'class-yoga-1',
    classGroupId: 'group-morning-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),
  ClassGroupAssignment.reconstitute({
    id: 'cga-2',
    classId: 'class-pilates-1',
    classGroupId: 'group-morning-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-02T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),
  // soft-deleted: spin should never show up in findClassesByGroup results
  ClassGroupAssignment.reconstitute({
    id: 'cga-3',
    classId: 'class-spin-1',
    classGroupId: 'group-morning-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-03T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-04T00:00:00Z'),
    updatedBy: 'user-2',
    deletedAt: new Date('2024-01-04T00:00:00Z'),
    deletedBy: 'user-2',
    isDeleted: true,
  }),
  // different group entirely, for isolation checks
  ClassGroupAssignment.reconstitute({
    id: 'cga-4',
    classId: 'class-hiit-1',
    classGroupId: 'group-evening-1',
    businessId: 'business-1',
    createdAt: new Date('2024-01-05T00:00:00Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2024-01-05T00:00:00Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),
];

// Emulates the `classes.title` column the real repo pulls in via SQL join.
export const CLASS_TITLE_LOOKUP: Record<string, string> = {
  'class-yoga-1': 'Yoga',
  'class-pilates-1': 'Pilates',
  'class-spin-1': 'Spin',
  'class-hiit-1': 'HIIT',
};

export const CLASS_GROUP_NAME_LOOKUP: Record<string, string> = {
  'group-morning-1': 'Morning Group',
  'group-evening-1': 'Evening Group',
};
