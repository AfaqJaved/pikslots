import request from 'supertest';
import { SERVICE_USER_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';

import { successBody } from '../common/http-envelope';
import { endpointForParams } from '../common/endpoint-path';
import { setupServiceUserAssignmentTestContext } from './support/service-user-assignment-test-context';
import {
  createBusiness,
  createStaffUser,
  registerService,
  editService,
  createAssignment,
  removeUserFromService,
  findUsersByService,
  waitForActiveAssignmentCountByService,
  tokenForRole,
} from './support/service-user-assignment-fixtures';

describe(`GET ${SERVICE_USER_ASSIGNMENT_ENDPOINTS.FIND_BY_SERVICE}`, () => {
  const ctx = setupServiceUserAssignmentTestContext();

  it('returns a user assigned via the direct assign endpoint', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: serviceId } = await registerService(ctx, businessId);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const token = tokenForRole(ctx, 'Admin', businessId);
    await createAssignment(ctx, { serviceId, userId, businessId }, token);

    const response = await findUsersByService(ctx, serviceId, token);

    expect(response.status).toBe(200);
    const data = successBody<Record<string, unknown>[]>(response).data;
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ id: userId });
    expect(data[0]).toHaveProperty('firstName');
    expect(data[0]).toHaveProperty('lastName');
  });

  it('returns a user assigned via registering the service with associatedUsers, once the real worker processes it', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId } = await registerService(ctx, businessId, {
      associatedUsers: [userId],
    });

    // Real Redis -> real BullMQ worker -> real SyncServiceToUsersEventImpl,
    // asynchronously.
    await waitForActiveAssignmentCountByService(ctx, serviceId, 1);

    const response = await findUsersByService(
      ctx,
      serviceId,
      tokenForRole(ctx, 'Admin', businessId),
    );

    expect(response.status).toBe(200);
    expect(successBody(response).data).toEqual([
      expect.objectContaining({ id: userId }),
    ]);
  });

  it('returns an empty array for a service with no assigned users', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: serviceId } = await registerService(ctx, businessId);

    const response = await findUsersByService(
      ctx,
      serviceId,
      tokenForRole(ctx, 'Admin', businessId),
    );

    expect(response.status).toBe(200);
    expect(successBody(response).data).toEqual([]);
  });

  it('stops returning a user once removed via the direct remove endpoint', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: serviceId } = await registerService(ctx, businessId);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const token = tokenForRole(ctx, 'Admin', businessId);
    await createAssignment(ctx, { serviceId, userId, businessId }, token);

    await removeUserFromService(ctx, serviceId, userId, token).then((res) =>
      expect(res.status).toBe(200),
    );

    const response = await findUsersByService(ctx, serviceId, token);

    expect(response.status).toBe(200);
    expect(successBody(response).data).toEqual([]);
  });

  it('stops returning a user once removed via editing the service (empty associatedUsers)', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: userId } = await createStaffUser(ctx, businessId, 'Standard');
    const { id: serviceId, title } = await registerService(ctx, businessId, {
      associatedUsers: [userId],
    });

    await waitForActiveAssignmentCountByService(ctx, serviceId, 1);

    // Editing the service with an empty associatedUsers list drops the
    // assignment -- the edit use case always re-fires the sync event so
    // removals process, unlike register which only fires when non-empty.
    await editService(ctx, serviceId, businessId, {
      title,
      associatedUsers: [],
    });

    await waitForActiveAssignmentCountByService(ctx, serviceId, 0);

    const response = await findUsersByService(
      ctx,
      serviceId,
      tokenForRole(ctx, 'Admin', businessId),
    );

    expect(response.status).toBe(200);
    expect(successBody(response).data).toEqual([]);
  });

  it('returns 401 when no auth token is provided', async () => {
    const { id: businessId } = await createBusiness(ctx);
    const { id: serviceId } = await registerService(ctx, businessId);

    await request(ctx.app.getHttpServer())
      .get(
        endpointForParams(SERVICE_USER_ASSIGNMENT_ENDPOINTS.FIND_BY_SERVICE, {
          serviceId,
        }),
      )
      .expect(401);
  });

  describe('known bug: no tenant isolation on lookup', () => {
    // Mirrors the Service Group Assignment suite's read-leak bug:
    // FindUsersByServiceUseCaseImpl never touches SecurityContext, and
    // ServiceUserAssignmentRepositoryImpl.findUsersByService never filters
    // by business_id -- it joins purely on sua.service_id, scoped only by
    // sua.is_deleted.
    it("leaks another business's assigned user when given their serviceId", async () => {
      const { id: businessA } = await createBusiness(ctx);
      const { id: businessB } = await createBusiness(ctx);
      const { id: userIdInB } = await createStaffUser(
        ctx,
        businessB,
        'Standard',
      );
      const { id: serviceIdInB } = await registerService(ctx, businessB, {
        associatedUsers: [userIdInB],
      });
      await waitForActiveAssignmentCountByService(ctx, serviceIdInB, 1);

      // Caller is an Admin of business A, asking about a service that
      // belongs to business B.
      const response = await findUsersByService(
        ctx,
        serviceIdInB,
        tokenForRole(ctx, 'Admin', businessA),
      );

      expect(response.status).toBe(200);
      // Documents the leak: business A's Admin sees business B's user.
      expect(successBody(response).data).toEqual([
        expect.objectContaining({ id: userIdInB }),
      ]);
    });
  });
});
