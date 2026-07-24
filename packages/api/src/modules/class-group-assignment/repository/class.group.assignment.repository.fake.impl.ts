// class-group-assignment.repository.fake.impl.ts
import {
  ClassGroupAssignment,
  ClassGroupSummary,
  ClassSummary,
  err,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { ClassGroupAssignmentRepository } from '@pikslots/domain';
import {
  CLASS_GROUP_ASSIGNMENT_TEST_DATA,
  CLASS_GROUP_NAME_LOOKUP,
  CLASS_TITLE_LOOKUP,
} from './class.group.assignment.fake.data';

export class ClassGroupAssignmentRepositoryTestImpl implements ClassGroupAssignmentRepository {
  async save(
    assignment: ClassGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    CLASS_GROUP_ASSIGNMENT_TEST_DATA.push(assignment);
    return ok(undefined);
  }

  async saveAll(
    assignments: ClassGroupAssignment[],
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    CLASS_GROUP_ASSIGNMENT_TEST_DATA.push(...assignments);
    return ok(undefined);
  }

  async findById(
    id: string,
  ): Promise<Result<ClassGroupAssignment | null, InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      CLASS_GROUP_ASSIGNMENT_TEST_DATA.find((a) => a.id === id) ?? null,
    );
  }

  async findAllByClassGroup(
    classGroupId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      CLASS_GROUP_ASSIGNMENT_TEST_DATA.filter(
        (a) => a.classGroupId === classGroupId,
      ),
    );
  }

  async findAllByClass(
    classId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      CLASS_GROUP_ASSIGNMENT_TEST_DATA.filter((a) => a.classId === classId),
    );
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      CLASS_GROUP_ASSIGNMENT_TEST_DATA.filter(
        (a) => a.businessId === businessId,
      ),
    );
  }

  async findByClassAndGroup(
    classId: string,
    classGroupId: string,
  ): Promise<Result<ClassGroupAssignment | null, InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      CLASS_GROUP_ASSIGNMENT_TEST_DATA.find(
        (a) =>
          a.classId === classId &&
          a.classGroupId === classGroupId &&
          !a.isDeleted,
      ) ?? null,
    );
  }

  async existsByClassAndGroup(
    classId: string,
    classGroupId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      CLASS_GROUP_ASSIGNMENT_TEST_DATA.some(
        (a) =>
          a.classId === classId &&
          a.classGroupId === classGroupId &&
          !a.isDeleted,
      ),
    );
  }

  async findClassesByGroup(
    classGroupId: string,
  ): Promise<Result<ClassSummary[], InfrastructureError>> {
    await Promise.resolve('');
    const classes = CLASS_GROUP_ASSIGNMENT_TEST_DATA.filter(
      (a) => a.classGroupId === classGroupId && !a.isDeleted,
    ).map((a) => ({
      id: a.classId,
      title: CLASS_TITLE_LOOKUP[a.classId] ?? '',
    }));
    return ok(classes);
  }

  async update(
    assignment: ClassGroupAssignment,
  ): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    const index = CLASS_GROUP_ASSIGNMENT_TEST_DATA.findIndex(
      (a) => a.id === assignment.id,
    );
    if (index === -1) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Class group assignment not found for update',
        timestamp: new Date(),
        cause: undefined,
      });
    }
    CLASS_GROUP_ASSIGNMENT_TEST_DATA[index] = assignment;
    return ok(undefined);
  }

  async deleteById(id: string): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    const index = CLASS_GROUP_ASSIGNMENT_TEST_DATA.findIndex(
      (a) => a.id === id,
    );
    if (index !== -1) CLASS_GROUP_ASSIGNMENT_TEST_DATA.splice(index, 1);
    return ok(undefined);
  }

  async findGroupsByClass(
    classId: string,
  ): Promise<Result<ClassGroupSummary[], InfrastructureError>> {
    await Promise.resolve('');
    const groups = CLASS_GROUP_ASSIGNMENT_TEST_DATA.filter(
      (a) => a.classId === classId && !a.isDeleted,
    ).map((a) => ({
      id: a.classGroupId,
      name: CLASS_GROUP_NAME_LOOKUP[a.classGroupId] ?? '',
    }));
    return ok(groups);
  }
}
