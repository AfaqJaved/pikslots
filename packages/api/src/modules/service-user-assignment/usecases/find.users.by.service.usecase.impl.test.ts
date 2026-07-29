import { err, InfrastructureError } from '@pikslots/domain';
import { FindUsersByServiceUseCaseImpl } from './find.users.by.service.usecase.impl';
import { ServiceUserAssignmentRepositoryTestImpl } from '../repository/service.user.assignment.repository.fake.impl';
import { SERVICE_USER_ASSIGNMENT_TEST_DATA } from '../repository/service.user.assignment.test.data';

describe('FindUsersByServiceUseCaseImpl', () => {
  let repository: ServiceUserAssignmentRepositoryTestImpl;
  let useCase: FindUsersByServiceUseCaseImpl;

  beforeEach(() => {
    repository = new ServiceUserAssignmentRepositoryTestImpl(
      SERVICE_USER_ASSIGNMENT_TEST_DATA,
    );

    useCase = new FindUsersByServiceUseCaseImpl(repository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return all users assigned to a service', async () => {
      const result = await useCase.execute('service-1');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toHaveLength(2);

        expect(result.value).toEqual([
          {
            id: 'user-1',
            firstName: 'First-user-1',
            lastName: 'Last-user-1',
          },
          {
            id: 'user-2',
            firstName: 'First-user-2',
            lastName: 'Last-user-2',
          },
        ]);
      }
    });

    it('should return an empty array when the service has no assigned users', async () => {
      const result = await useCase.execute('unknown-service');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('should not return soft deleted assignments', async () => {
      const result = await useCase.execute('service-4');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('should call repository with the correct service id', async () => {
      const spy = jest.spyOn(repository, 'findUsersByService');

      await useCase.execute('service-1');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('service-1');
    });

    it('should propagate InfrastructureError returned by repository', async () => {
      const infrastructureError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Database connection failed',
        timestamp: new Date(),
        cause: new Error('DB Error'),
      };

      jest
        .spyOn(repository, 'findUsersByService')
        .mockResolvedValueOnce(err(infrastructureError));

      const result = await useCase.execute('service-1');

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infrastructureError);
      }
    });
  });
});
